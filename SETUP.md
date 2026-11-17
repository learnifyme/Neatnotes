# Physics 12 — GitHub Pages website

A lightweight Class 12 Physics library with separate **Derivations** and **Formulas** sections, 10 chapters, search, and a protected admin panel. Admins add a topic title and its Google Drive PDF link. Visitors can open the PDF in a new tab.

## Important: how this is hosted

GitHub Pages only hosts static files. It cannot securely process admin logins or store uploads by itself. This project uses **Supabase** for authentication and the resource database; GitHub Pages hosts the website. The PDFs themselves remain in your Google Drive.

## 1. Create the Supabase project

1. Create a free project at https://supabase.com/.
2. Open **Project Settings → API** (or **Data API / API Keys**, depending on the dashboard version).
3. Copy the Project URL and the publishable key (or legacy `anon` public key).
4. Open `config.js` and replace the two `YOUR_...` values. Never use a `service_role` or secret key in this file.

## 2. Create the resources table

1. In Supabase, open **SQL Editor → New query**.
2. Paste all the contents of `supabase.sql` and run it.
3. In **Authentication → Users**, create the account you will use as the site administrator. Use an email and password you control. Do not share the password.
4. For a private admin-only site, disable public signups in Supabase Authentication settings. The public website can still read the resource list.

The SQL policies allow anyone to read resources, while only authenticated users can insert and delete rows. The insert policy also ensures the row's `created_by` matches the signed-in account. For a single-admin setup, create only your own account and keep signups disabled.

## 3. Add Google Drive PDFs

For each PDF in Google Drive:
1. Open the file's **Share** settings.
2. Set General access to **Anyone with the link — Viewer** (otherwise visitors may see an access-denied page).
3. Copy the link.
4. In your website, choose **Admin login**, sign in, select Derivations or Formulas, choose a chapter, enter the topic name and paste the Drive link.
5. Click **Add topic**. The topic appears in the matching chapter.

Only use links to PDFs you have permission to share. The site validates that the link is an HTTPS Google Drive/Google Docs URL.

## 4. Publish on GitHub Pages

1. Create a GitHub repository, for example `physics-12-notes`.
2. Upload `index.html`, `style.css`, `app.js`, and `config.js` to the repository root. You can also include this README and `supabase.sql`.
3. In the repository, open **Settings → Pages**.
4. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
5. Wait for GitHub Pages to publish. Your website address will look like `https://YOUR-USERNAME.github.io/physics-12-notes/`.

## 5. Updating content

Use the Admin login button on the live website. Add topics as you prepare PDFs. To remove a topic, sign in and use Delete beside it.

## Notes and troubleshooting

- Supabase's URL and publishable/anon key are intended for browser use when Row Level Security is configured correctly. Never paste a secret or `service_role` key into `config.js` or GitHub.
- If the admin panel says it is not configured, check `config.js` and reload.
- If the library is empty, make sure the SQL script ran successfully and check the browser console for Supabase errors.
- If a PDF asks visitors to request access, change that file's Drive sharing to **Anyone with the link — Viewer**.
- Google Drive preview behavior can vary by account and file settings. The website opens the share link in a new tab rather than trying to bypass Drive permissions.
- The initial chapter list follows the 10 chapter names supplied for this project.
