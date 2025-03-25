// Auxilliary functions for handeling database connection and CRUD operations

async function connectDB(client) {
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Connection Failed", error);
    }
}

async function insertData(client, dbName, collectionName, data) {
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        await collection.insertOne(data);

        console.log("Success: Data was inserted");
    } catch (error) {
        console.log("Failed: data was not inserted.");
    }
}

async function getData(client, dbName, collectionName, filter) {
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        const data = await collection.find(filter).toArray();

        return data;
    } catch (error) {
        console.log("Failed to get data");
        return [];
    }
}

async function updateData(client, dbName, collectionName, filter, update) {
    try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        await collection.updateOne(filter, update);

        console.log("Success: Data was updated.")
    } catch (error) {
        console.log("Failed: Data was not updated.");
    }
}

async function deleteData(client, dbName, collectionName, filter, many) {
        try {
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        if (many) {
            collection.deleteMany(filter);
        }
        else {
            collection.deleteOne(filter);
        }

        console.log("Success: Data was deleted.")
    } catch (error) {
        console.log("Failed: Data was not deleted.");
    }
}

module.exports = { connectDB, insertData, getData, updateData, deleteData };
