# Sanitized database fixtures

This directory is the only place where database-like content may be committed.
Files matching `*.fixture.json` must contain synthetic demo data that has been
reviewed by a person.

Never add a live database, SQL dump, PostgreSQL data directory, password or
password hash, token, encryption key, real identity, medical image, storage
path, AI conversation, or audit log here. The production database structure is
versioned separately in `backend/migrations/`.

`demo_database.fixture.json` is consumed by `app.demo`. Identity values are
derived and encrypted at seed time, and passwords are handled by the seeding
code rather than stored in the fixture.
