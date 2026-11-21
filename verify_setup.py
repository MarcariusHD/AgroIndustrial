import os

def run_diagnostic():
    print("=== Diagnóstico de Sistema AgroIndustrial ===")
    
    # 1. Verificación de carpetas (Case Sensitivity)
    print("\n[1] Verificando carpetas:")
    items = os.listdir('.')
    for target in ['models', 'Models']:
        if target in items:
            print(f" - [!] Encontrada: '{target}'")
        else:
            print(f" - [ ] NO encontrada: '{target}'")
            
    # 2. Verificación de Importaciones Python
    print("\n[2] Verificando lógica de Backend:")
    try:
        from models.usuario import Usuario
        print(" - OK: 'models.usuario' se importa correctamente.")
    except ImportError as e:
        print(f" - ERROR: Fallo de importación: {e}")
        
    # 3. Análisis de App.jsx
    print("\n[3] Analizando src/App.jsx:")
    try:
        with open('src/App.jsx', 'r', encoding='utf-8') as f:
            content = f.read()
            open_divs = content.count('<div')
            close_divs = content.count('</div>')
            open_braces = content.count('{')
            close_braces = content.count('}')
            
            print(f" - <div> abiertos: {open_divs} | cerrados: {close_divs}")
            print(f" - Braces {{ abiertos: {open_braces} | cerrados: {close_braces}")
            
            if open_divs != close_divs:
                print(f" - [!] ALERTA: Tienes {abs(open_divs - close_divs)} DIV(s) de diferencia.")
            if open_braces != close_braces:
                print(f" - [!] ALERTA: Tienes {abs(open_braces - close_braces)} llaves {{}} de diferencia.")
    except FileNotFoundError:
        print(" - [ERROR] No se encontró src/App.jsx")

if __name__ == "__main__":
    run_diagnostic()