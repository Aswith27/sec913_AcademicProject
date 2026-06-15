# Backend

Run the API from the `backend` folder:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Available endpoints:

- `GET /api/dashboard`
- `POST /api/search`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/{subscription_id}/status`
- `PATCH /api/subscriptions/{subscription_id}/plan`

This demo models the required SQL tables (`users`, `plans`, `subscriptions`) and
MongoDB collections (`plan_descriptions`, `plan_embeddings`, `subscription_logs`)
using in-memory seed data so the project can run without external database setup.
