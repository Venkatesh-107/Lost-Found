import PocketBase from 'pocketbase';

(async () => {
  const pb = new PocketBase('http://127.0.0.1:8090');
  try {
    await pb.admins.authWithPassword('admin@example.com', 'admin123456'); // Standard fallback, wait, I don't know the admin password.
    console.log("Logged in");
  } catch(e) {
    console.log("Could not login:", e.message);
  }
})();
