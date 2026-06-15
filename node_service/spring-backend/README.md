# Spring Backend

This is a Spring Boot + PostgreSQL version of the subscription management backend.

## Import into Spring Tools

1. Open `Spring Tool Suite`.
2. Choose `File -> Import -> Existing Maven Projects`.
3. Select the folder:

```text
C:\Users\CHARAN\Downloads\DSEDBD_PROJECT\spring-backend
```

4. Let STS download Maven dependencies.
5. Open `src/main/resources/application.properties`.
6. Update the PostgreSQL username/password if needed.
7. Run `SubscriptionManagementApplication.java` as a Spring Boot app.

## PostgreSQL setup

Create the database:

```sql
CREATE DATABASE sub_mth;
```

Default app config:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sub_mth
spring.datasource.username=postgres
spring.datasource.password=postgres
```

## API endpoints

- `GET /api/dashboard`
- `POST /api/search`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/{subscriptionId}/status`
- `PATCH /api/subscriptions/{subscriptionId}/plan`

## Frontend

Keep the React frontend running from:

```powershell
cd C:\Users\CHARAN\Downloads\DSEDBD_PROJECT\frontend\frontend
npm run dev
```

The frontend will call the Spring backend on `http://127.0.0.1:8002`.

## Optional H2 fallback

If you want to run without PostgreSQL temporarily in STS, set the active profile to:

```text
h2
```

That uses `application-h2.properties` and keeps the backend on port `8002`, so the frontend proxy works the same way for PostgreSQL and H2.
