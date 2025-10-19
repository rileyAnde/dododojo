// Example TypeScript file to request data from your Rust API
interface User {
    username: string;
    password: string;
}

async function getAllUsers(): Promise<User[]> {
    try {
        const response = await fetch('http://localhost:8080/users', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users: User[] = await response.json();
        return users;
    } catch (error) {
        console.error('Error fetching users:', error);
        throw error;
    }
}

// Usage example
async function main() {
    try {
        const users = await getAllUsers();
        console.log('Users:', users);
    } catch (error) {
    console.error('Failed to get users:', error);
    }
}

// Call the function
main();