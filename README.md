## How to run program locally
#### Follow these basic steps: 
---
1. Pull down the latest main
2. Ask Ciaran for the .env file to connect to the database 
  - Optional: to query the db directly, download MySQL Workbench and use the same connection information
3. In the terminal:
  - `cd server`
      - run `npm install` to make sure the pacakges are up to date
      - Note: you may have to run the command `npx prisma generate` so the prisma schema is correct 
      - run `node server.js` to start the server
  - `cd client`
      - run `npm install` again to make sure the packages in the client dir are up to date
      - run `npm run dev` to start the client
 4. Follow the localhost link
  - currently only the `Biology` major has been populated with data
---
