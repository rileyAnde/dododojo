using SQLite for database as it is built in for nearly everything

To test client_example.ts it has to be compiled into js (idk why thats what it told me)

run
```bash
npx tsc client_example.ts --outDir dist
```
make sure you cd directly to where the file is.

then you can run the rust http server to connect to (ill but an exe of it to actually run if you dont want to compile the rust directly)

if you do want to compile and have the rust toolchain for some reason run
```bash
cargo run
```
in the db_interface folder (you dont have to be in the src dir for rust)

Now you should have the http server running and the client_interface compiled so now you can run 
```bash
node dist/client_example.js
```
the output should be 
```
Users: [ { username: 'admin', password: 'securepassword' } ]
```
as there is only one user in the temp db currently.