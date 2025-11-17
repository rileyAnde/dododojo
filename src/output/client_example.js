"use strict";
async function getUserByUsername(username) {
    try {
        const response = await fetch(`http://localhost:8080/user/${username}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const user = await response.json();
        return user;
    }
    catch (error) {
        console.error('Error fetching user:', error);
        throw error;
    }
}
// Usage example
async function main() {
    try {
        const username = 'admin'; // Change to a username that exists in your DB
        const user = await getUserByUsername(username);
        console.log('User:', user);
    }
    catch (error) {
        console.error('Failed to get user:', error);
    }
}
// Call the function
main();
//# sourceMappingURL=client_example.js.map