# Backups consistentes do MongoDB

Este projeto usa MongoDB para persistência. Abaixo, estratégias de backup e restauração consistentes, com foco em Windows.

- Importante: habilite o journaling (padrão) no MongoDB para garantir consistência.
- Faça backups fora do horário de pico, e se possível em réplica (MongoDB Atlas recomendado).

## 1) mongodump / mongorestore (backup lógico)

Backup completo do banco `microfisio_db`:

```powershell
# Exporta para a pasta .\backups\microfisio-YYYYMMDD-HHmm
$ts = Get-Date -Format "yyyyMMdd-HHmm"
$dest = ".\backups\microfisio-$ts"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
mongodump --db microfisio_db --out $dest --uri "mongodb://localhost:27017"
```

Restauração completa:

```powershell
# Restaura a partir de um diretório gerado pelo mongodump
$src = ".\backups\microfisio-20250101-0100"
mongorestore --drop --db microfisio_db $src\microfisio_db --uri "mongodb://localhost:27017"
```

- `--drop` apaga as coleções antes de restaurar (use com cuidado).
- Para backup/restore de apenas uma coleção: use `--collection <nome>`.

## 2) MongoDB Atlas (recomendado)

- Crie um cluster no Atlas (Free/Shared já oferece backups de snapshot na camada paga).
- Habilite Continuous Backups (PITR) para restaurações a qualquer ponto no tempo.
- Conecte o app via string do Atlas em `appsettings.json`:
  - `MongoDb:ConnectionString = "mongodb+srv://<user>:<pass>@<cluster>.mongodb.net"`

## 3) Agendamento de backups no Windows

- Use o Agendador de Tarefas para executar o script PowerShell diariamente.
- Exemplo de ação:
  - Programa: `powershell.exe`
  - Argumentos: `-ExecutionPolicy Bypass -File C:\caminho\scripts\backup-microfisio.ps1`

Exemplo de `backup-microfisio.ps1` (salve em `scripts/`):

```powershell
$ts = Get-Date -Format "yyyyMMdd-HHmm"
$dest = "C:\Backups\microfisio-$ts"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
mongodump --db microfisio_db --out $dest --uri "mongodb://localhost:27017"
# (Opcional) Compactar
Compress-Archive -Path "$dest\*" -DestinationPath "${dest}.zip"
Remove-Item -Recurse -Force $dest
```

## 4) Teste seus backups

- Periodicamente execute uma restauração em um ambiente de teste.
- Valide que as coleções (`pacientes`, `usuarios`, `agendamentos`, `relatorios`) estão íntegras.

## 5) Boas práticas adicionais

- Versione apenas scripts, nunca dumps.
- Encripte backups e armazene em local seguro (ex.: Azure Blob, S3, OneDrive corporativo).
- Defina retenção (ex.: 7 diários, 4 semanais, 3 mensais).
