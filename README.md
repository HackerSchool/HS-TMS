# HS-TMS

HackerSchool's Treasury Management System: the main control system for the treasury
inside HackerSchool, which can read billing documents and write to a treasury balance.

You can check out the app as a demo user in the [current deployment](https://hs-tms.ngfg.pt/).

Some of its key features:
- Supports authentication via FenixEdu and also allows for authentication as a
  demo user.
- Lets the users create reminders for treasury-related events, sending email
  notifications when they are reaching their due date
- Transactions and Projects management
  - The transactions can be filtered by several criteria and then be printed
    to a PDF report, making periodical reports easy to create.
  - When creating a transaction, a PDF receipt may be attached, which will be available
    for download later
- Data visualization through different types of charts
- Every week, a summary of all the changes done to the system is sent via email 
- Remote access to server logs, allowing for easy activity monitoring and debugging

The app currently has five panels:
- **Dashboard**: allows for a quick system overview, providing information
  such as the total balance, number of active projects, recent transactions, and
  upcoming reminders.
- **Transactions**: shows all the transactions according to the specified filters
  and lets the user create, edit, or delete transactions as well as print a PDF
  report of the selected transactions.
- **Projects**: displays the existing projects given the applied filters and allows
  the user to create, edit, or delete them.
- **Charts**: several charts that help manage projects and their
  earnings/costs by providing different views of the treasury and ways to
  compare projects and periods.
- **Settings**: lets the user manage the authorized members in the system and
  check the server logs remotely to check errors and activity in the backend.


## Getting Started

### Prerequisites:

- [Git](https://git-scm.com/) for cloning the repo
- [Docker](https://www.docker.com/) to run the project in a containerized environment
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) is an all-in-one
    solution that provides a GUI that makes managing containers, images, and volumes
    easier.

### Installation:

1. Clone this repository
2. Copy `.env.example` to `.env`
3. Copy `frontend/.env.example` to `frontend/.env`
4. Copy `backend/.env.example` to `backend/.env`
   - If you only want to log in as a demo user, set the following variables:
     - `SESSION_SECRET=example`
     - `FENIX_CLIENT_ID=example`
     - `FENIX_CLIENT_SECRET=example`
     - `RESEND_API_KEY=example`
   - If you want to log in using FenixEdu and use [Resend](https://resend.com/) to
     send summary/reminder emails, you'll need to set up `FENIX_CLIENT_ID`,
     `FENIX_CLIENT_SECRET`, and `RESEND_API_KEY` with your credentials.
     It is advised to set `SESSION_SECRET` to a bigger string of random characters
     to increase security, since it is used to sign cookies.
5. Run `docker compose up --build` at the project root to create and run all the
   containers
   - add `-d` to detach the process from the terminal at the end
6. Since we're using HTTPS, to ensure everything runs as expected, you need to
   import the caddy certificate to your browser:
   - To get the certificate, run
     `docker cp hs-tms_caddy:/data/caddy/pki/authorities/local/root.crt .`,
     which will place it in your current directory
   - Install it in your browser as an authority certificate. The procedure should
     be similar to this:
     1. `Settings > Security > Manage certificates > Authorities > import`
     2. Restart the browser to ensure the certificate is loaded
7. **If you'll be using FenixEdu authentication**, you need to first add your
   username to the authorized people list (after having access to the system,
   you won't need to repeat this step to add other people, you can do it
   from inside the app in the 'Settings' tab)
   - run `docker exec -it hs-tms_postgres psql -U postgres postgres -c "CALL create_user('#istID', '#Name');"`
     - `#istID` follows the syntax `ist1xxx`
     - `#Name` can be your first and last name.
