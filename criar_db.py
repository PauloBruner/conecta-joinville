import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

cursor.execute('''
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT,
    email TEXT,
    senha TEXT
)
''')

cursor.execute('''
CREATE TABLE ajudas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    necessidade_id INTEGER
)
''')

cursor.execute('''
CREATE TABLE necessidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT,
    descricao TEXT,
    bairro TEXT
)
''')

conn.commit()
conn.close()

print("Banco criado com sucesso!")