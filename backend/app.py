import os
import json
import mysql.connector
from flask import Flask, request, jsonify
from flask_cors import CORS
import chromadb
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

MYSQL_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': 'MedNexus_Global'
}
GROQ_API_KEY = os.getenv('GROQ_API_KEY')

groq_client = Groq(api_key=GROQ_API_KEY)
chroma_client = chromadb.Client()

# Dynamic training logic remains the same
def train_vector_db():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = %s", (MYSQL_CONFIG['database'],))
        tables = cursor.fetchall()
        schema_info = []
        for table in tables:
            t_name = table.get('TABLE_NAME') or table.get('table_name')
            cursor.execute("SELECT COLUMN_NAME FROM information_schema.columns WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s", (MYSQL_CONFIG['database'], t_name))
            cols = [c.get('COLUMN_NAME') or c.get('column_name') for c in cursor.fetchall()]
            schema_info.append(f"Table: {t_name}. Columns: {', '.join(cols)}")
        
        global collection
        try: chroma_client.delete_collection("sql_schema")
        except: pass
        collection = chroma_client.create_collection(name="sql_schema")
        collection.upsert(documents=schema_info, ids=[str(i) for i in range(len(schema_info))])
        print("✅ Vector DB Trained.")
        cursor.close()
        conn.close()
    except Exception as e: print(f"❌ Training Error: {e}")

train_vector_db()

def generate_structured_query(user_prompt,history=[]):
    results = collection.query(query_texts=[user_prompt], n_results=5)
    schema_context = "\n".join(results['documents'][0]) if results['documents'] else ""
    
    # Force JSON output for visualization intent
    system_prompt = f"""
You are a STRICT MySQL Expert and Data Visualizer for the 'MedNexus_Global' database.

### 1. CORE OPERATING PRINCIPLES
- Use ONLY the exact table and column names provided in the Schema.
- ALWAYS return a valid JSON object with the keys: "sql", "type", and "reason".
- VISUALIZATION TYPES: "table", "bar", "line", "pie", "donut".

### 2. DATABASE SCHEMA CONTEXT
{schema_context}

### 3. RELATIONSHIP & JOIN RULES (CRITICAL)
- Patient Linkage: patients.patient_id -> medical_records, appointments, admissions, billing, lab_reports.
- Doctor Linkage: doctors.doc_id -> medical_records, appointments.
- Department Linkage: departments.dept_id -> doctors, staff.
- NEVER: Join doctor names from the patients table; join unrelated columns; or invent foreign keys.
- ALWAYS: Use direct JOINs instead of subqueries. Prefix all columns with table aliases (e.g., p.name, d.name). Use DISTINCT to prevent duplicate rows.

### 4. STRICT OUTPUT & DATA INTEGRITY
- NO RAW IDs: Never return only an ID (doc_id, patient_id). You MUST join the parent table to get the 'name'.
- DOCTORS: Always include 'name' and 'specialty'.
- PATIENTS: Always include 'name' and 'blood_group' or 'phone'.
- DEPARTMENTS: Always include the department 'name'.
- DOCTOR-PATIENT LOOKUP: If asked for a "doctor of a patient" or vice versa, you MUST join 'doctors', 'patients', and 'medical_records' or 'appointments' to show actual names.

### 5. SESSION MEMORY & FOLLOW-UP LOGIC
- ORDINAL RESOLUTION: If the user asks for the "first", "last", or "top" record, identify that specific NAME from the 'Previously returned rows' in history and query: SELECT * FROM [table] WHERE name = '[Name]'.
- PRONOUN RESOLUTION: "Their", "them", "this patient", or "that doctor" refers to the names found in the most recent 'Previously returned rows'.
- TABLE PERSISTENCE: If the user previously listed DOCTORS, "their details" refers to the doctors table. NEVER switch to 'staff' unless explicitly requested.

### 6. ANALYTICAL & GRAPH RULES
- GRAPH AGGREGATION: If a graph is requested for a large dataset, DO NOT 'SELECT *'. Perform a GROUP BY on a categorical column (e.g., category, specialty, blood_group).
- TRENDS: Use 'line' for time-based data.
- COMPARISONS: Use 'bar' for category comparisons.
- PROPORTIONS: Use 'pie' or 'donut' for small category sets (<= 6 rows).
- CONTINUITY: If the previous turn used a graph, continue using the graph format for brief follow-ups (e.g., "and doctors?").

### 7. SQL SYNTAX SPECIALS
- Use LIKE with wildcards (%) for all name searches (e.g., WHERE p.name LIKE '%Aarna%').
- "Most selling" -> SUM(quantity).
- "Most costly" -> ORDER BY price DESC.
- "Show all data" -> SELECT * FROM [table].

### 8. ERROR PREVENTION
- If names are missing from history for an 'IN' clause, DO NOT generate empty parentheses like 'IN ()'. Fallback to a general table query.
- Qualify all columns to avoid "ambiguous column" errors in joins.

"""

    messages = [{"role": "system", "content": system_prompt}]

    for msg in history:
        messages.append(msg)

    messages.append({"role": "user", "content": user_prompt})


    
    completion = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        response_format={"type": "json_object"} # Enable JSON mode
    )
    return json.loads(completion.choices[0].message.content)

@app.route('/ask', methods=['POST'])
def ask_database():
    data = request.json
    question = data.get('question')
    history = data.get('history', [])
    try:
        ai_resp = generate_structured_query(question, history)
        sql = ai_resp.get("sql", "").strip()
        print("Generated SQL:", sql)
        vis_type = ai_resp.get("type", "table")

        if "REFUSED" in sql.upper():
            return jsonify({"text": "I cannot disclose private info.", "type": "text"})

        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)
        cursor.execute(sql)
        results = cursor.fetchall()
        cursor.close()
        conn.close()

        # Return structured response f
        return jsonify({
            "data": results if results else [],
            "type": vis_type if results else "text",
            "text": "Here is the data you requested." if results else "No records found."
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/tables', methods=['GET'])
def get_tables():
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT TABLE_NAME 
            FROM information_schema.tables 
            WHERE TABLE_SCHEMA = %s
        """, (MYSQL_CONFIG['database'],))

        tables = [row['TABLE_NAME'] for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify({
            "database": MYSQL_CONFIG['database'],
            "tables": tables
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)