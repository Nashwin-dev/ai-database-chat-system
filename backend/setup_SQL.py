import os
import mysql.connector
from faker import Faker
import random
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()
fake = Faker("en_IN")

DATABASE_NAME = "MedNexus_Global"

db_config = {
    "host": "localhost",
    "user": "root",
    "password": os.getenv("MYSQL_PASSWORD"),
}


def setup_hospital_database():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()

        print("🔄 Resetting Database...")
        cursor.execute(f"DROP DATABASE IF EXISTS {DATABASE_NAME}")
        cursor.execute(f"CREATE DATABASE {DATABASE_NAME}")
        cursor.execute(f"USE {DATABASE_NAME}")
        print("✅ Database created.\n")

        # ==============================
        # 1️⃣ CREATE TABLES
        # ==============================

        cursor.execute("""
        CREATE TABLE departments (
            dept_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            floor INT,
            head_of_dept VARCHAR(255),
            contact_ext VARCHAR(10)
        )
        """)

        cursor.execute("""
        CREATE TABLE doctors (
            doc_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            specialty VARCHAR(100),
            dept_id INT,
            email VARCHAR(255),
            years_experience INT,
            FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE patients (
            patient_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            dob DATE,
            gender ENUM('Male','Female','Other'),
            blood_group VARCHAR(5),
            phone VARCHAR(15)
        )
        """)

        cursor.execute("""
        CREATE TABLE rooms (
            room_id INT AUTO_INCREMENT PRIMARY KEY,
            room_no VARCHAR(10),
            type ENUM('General','Private','ICU','Deluxe'),
            status ENUM('Available','Occupied','Maintenance'),
            daily_rate DECIMAL(10,2),
            floor INT
        )
        """)

        cursor.execute("""
        CREATE TABLE admissions (
            adm_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            room_id INT,
            admission_date DATETIME,
            discharge_date DATETIME NULL,
            emergency_contact VARCHAR(20),
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
            FOREIGN KEY (room_id) REFERENCES rooms(room_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE appointments (
            app_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            doc_id INT,
            app_date DATETIME,
            status ENUM('Scheduled','Completed','Cancelled','No-show'),
            reason_for_visit TEXT,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
            FOREIGN KEY (doc_id) REFERENCES doctors(doc_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE medical_records (
            record_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            doc_id INT,
            diagnosis TEXT,
            treatment_plan TEXT,
            recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id),
            FOREIGN KEY (doc_id) REFERENCES doctors(doc_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE medications (
            med_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            category VARCHAR(100),
            stock INT,
            price DECIMAL(10,2),
            expiry_date DATE
        )
        """)

        cursor.execute("""
        CREATE TABLE prescriptions (
            presc_id INT AUTO_INCREMENT PRIMARY KEY,
            record_id INT,
            med_id INT,
            dosage VARCHAR(100),
            duration_days INT,
            instructions TEXT,
            FOREIGN KEY (record_id) REFERENCES medical_records(record_id),
            FOREIGN KEY (med_id) REFERENCES medications(med_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE staff (
            staff_id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            role VARCHAR(100),
            dept_id INT,
            shift ENUM('Morning','Afternoon','Night'),
            hire_date DATE,
            FOREIGN KEY (dept_id) REFERENCES departments(dept_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE billing (
            bill_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            total_amount DECIMAL(10,2),
            tax_amount DECIMAL(10,2),
            payment_status ENUM('Paid','Pending','Partial'),
            payment_method ENUM('Cash','Insurance','Card'),
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        )
        """)

        cursor.execute("""
        CREATE TABLE lab_reports (
            report_id INT AUTO_INCREMENT PRIMARY KEY,
            patient_id INT,
            test_name VARCHAR(255),
            result TEXT,
            reference_range VARCHAR(255),
            test_date DATE,
            FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
        )
        """)

        conn.commit()
        print("✅ Tables created.\n")

        # ==============================
        # 2️⃣ INSERT MASTER DATA
        # ==============================

        print("🚀 Inserting master data...")

        departments = [
            ("Cardiology",1,fake.name(),"EXT-101"),
            ("Neurology",2,fake.name(),"EXT-201"),
            ("Orthopedics",3,fake.name(),"EXT-301"),
            ("Pediatrics",1,fake.name(),"EXT-102"),
            ("Emergency",0,fake.name(),"EXT-000")
        ]
        cursor.executemany(
            "INSERT INTO departments (name,floor,head_of_dept,contact_ext) VALUES (%s,%s,%s,%s)",
            departments
        )

        rooms = [
            (f"R-{random.randint(100,500)}",
             random.choice(["General","Private","ICU","Deluxe"]),
             "Available",
             random.randint(1000,15000),
             random.randint(0,3))
            for _ in range(50)
        ]
        cursor.executemany(
            "INSERT INTO rooms (room_no,type,status,daily_rate,floor) VALUES (%s,%s,%s,%s,%s)",
            rooms
        )

        medications = [
            (fake.word().capitalize(),
             random.choice(["Antibiotic","Painkiller","Vaccine","Supplement"]),
             random.randint(50,500),
             random.uniform(10,1000),
             fake.date_between(start_date="+30d", end_date="+2y"))
            for _ in range(100)
        ]
        cursor.executemany(
            "INSERT INTO medications (name,category,stock,price,expiry_date) VALUES (%s,%s,%s,%s,%s)",
            medications
        )

        conn.commit()

        # ==============================
        # 3️⃣ INSERT DEPENDENT DATA
        # ==============================

        doctors = [
            (fake.name(),
             random.choice(["Surgeon","Consultant","Specialist"]),
             random.randint(1,5),
             fake.email(),
             random.randint(2,30))
            for _ in range(50)
        ]
        cursor.executemany(
            "INSERT INTO doctors (name,specialty,dept_id,email,years_experience) VALUES (%s,%s,%s,%s,%s)",
            doctors
        )

        patients = [
            (fake.name(),
             fake.date_of_birth(minimum_age=0, maximum_age=90),
             random.choice(["Male","Female","Other"]),
             random.choice(["A+","B+","O+","AB-"]),
             fake.phone_number()[:15])
            for _ in range(200)
        ]
        cursor.executemany(
            "INSERT INTO patients (name,dob,gender,blood_group,phone) VALUES (%s,%s,%s,%s,%s)",
            patients
        )

        staff = [
            (fake.name(),
             random.choice(["Nurse","Receptionist","Technician","Cleaner"]),
             random.randint(1,5),
             random.choice(["Morning","Afternoon","Night"]),
             fake.date_between(start_date="-5y", end_date="today"))
            for _ in range(80)
        ]
        cursor.executemany(
            "INSERT INTO staff (name,role,dept_id,shift,hire_date) VALUES (%s,%s,%s,%s,%s)",
            staff
        )

        conn.commit()

        # ==============================
        # 4️⃣ TRANSACTIONAL DATA
        # ==============================

        print("💉 Inserting transactional data...")

        for _ in range(300):

            p_id = random.randint(1,200)
            d_id = random.randint(1,50)
            r_id = random.randint(1,50)

            admission_date = fake.date_time_this_year()
            discharge_date = admission_date + timedelta(days=random.randint(1,10))

            cursor.execute("""
                INSERT INTO admissions (patient_id,room_id,admission_date,discharge_date,emergency_contact)
                VALUES (%s,%s,%s,%s,%s)
            """,(p_id,r_id,admission_date,discharge_date,fake.phone_number()[:15]))

            cursor.execute("""
                INSERT INTO billing (patient_id,total_amount,tax_amount,payment_status,payment_method)
                VALUES (%s,%s,%s,%s,%s)
            """,(p_id,
                 random.uniform(5000,50000),
                 random.uniform(500,2000),
                 random.choice(["Paid","Pending","Partial"]),
                 random.choice(["Cash","Insurance","Card"])
                 ))

            cursor.execute("""
                INSERT INTO appointments (patient_id,doc_id,app_date,status,reason_for_visit)
                VALUES (%s,%s,%s,%s,%s)
            """,(p_id,d_id,fake.date_time_this_year(),
                 random.choice(["Scheduled","Completed","Cancelled"]),
                 fake.sentence()))

            cursor.execute("""
                INSERT INTO medical_records (patient_id,doc_id,diagnosis,treatment_plan)
                VALUES (%s,%s,%s,%s)
            """,(p_id,d_id,fake.sentence(),fake.paragraph()))

            record_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO prescriptions (record_id,med_id,dosage,duration_days,instructions)
                VALUES (%s,%s,%s,%s,%s)
            """,(record_id,
                 random.randint(1,100),
                 "2 times daily",
                 random.randint(3,14),
                 "After meals"))

            cursor.execute("""
                INSERT INTO lab_reports (patient_id,test_name,result,reference_range,test_date)
                VALUES (%s,%s,%s,%s,%s)
            """,(p_id,
                 random.choice(["Blood Test","X-Ray","MRI","CT Scan"]),
                 "Normal",
                 "Standard Range",
                 fake.date_this_year()))

        conn.commit()

        print("🎉 MedNexus_Global fully populated with all 12 tables!")

    except mysql.connector.Error as err:
        print(f"❌ Error: {err}")

    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()


if __name__ == "__main__":
    setup_hospital_database()
