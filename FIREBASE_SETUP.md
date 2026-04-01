# Firebase Setup

EduCore is now configured to work on the free Firebase Spark path for hackathon demos.

That means:

- Auth uses Firebase Authentication.
- Roles are stored in Firestore `users` documents.
- Chat, groups, tasks, and progress use Firestore.
- Attachment messages use lightweight Firestore-backed demo file cards.
- Cloud Functions are optional and not required for the main demo flow.

## Current status

- Frontend Firebase SDK wiring is ready in `src/lib/firebase.js`.
- Live Firestore service flows are ready in `src/services/dataService.js`.
- Firestore rules are ready in `firestore.rules`.
- Storage is optional for the hackathon path.
- The repo can be deployed in Spark mode without Functions.

## Recommended free setup

1. Enable these Firebase services in the console:
   - Authentication
     - Email/Password
     - Google sign-in
   - Firestore Database

2. Add a Web app in Firebase and copy its config into `.env.local`.

3. Set the active project:

```powershell
firebase.cmd use --add
```

4. Deploy Firestore rules first:

```powershell
npm run firebase:deploy
```

Storage is not required for the hackathon demo path.

## What works on Spark

- Register as teacher
- Register as student
- Create subject
- Join with join code
- Create hackathon group
- Send real-time chat messages
- Create and move tasks
- Read live analytics from Firestore-backed progress data
- Add demo attachment cards inside chat

## What is optional

`functions/index.js` still exists, but it is not required for the hackathon path.
You only need Blaze if you later want to deploy custom role-claim logic through Cloud Functions.

## Verification checklist

After setup, test these in order:

1. Teacher register/login
2. Create a subject
3. Copy the join code
4. Student register/login
5. Join the class
6. Open workspace
7. Send chat message
8. Create task
9. Move task across columns
10. Add a demo attachment card in chat

## Helpful commands

Run locally:

```powershell
npm run dev
```

Build locally:

```powershell
npm run build
```

Deploy Firestore rules:

```powershell
npm run firebase:deploy
```

If you later upgrade the project and want real file uploads, you can still enable Storage and deploy `storage.rules`.
