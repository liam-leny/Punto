const neo4j = require('neo4j-driver');

class Database {
    constructor() {
        console.log("Connecté à la base de données Neo4j");
        if (Database.instance) {
            return Database.instance;
        }

        // Create a Neo4j driver instance
        this.driver = neo4j.driver(
            'bolt://localhost:7687',
            neo4j.auth.basic('neo4j', 'puntopunto')
        );

        // Save the instance for future use
        Database.instance = this;
    }

    // Function to run Cypher queries
    async query(cypherQuery, params) {
        const session = this.driver.session();

        try {
            const result = await session.run(cypherQuery, params);
            return result.records.map(record => record.toObject());
        } catch (error) {
            console.error(`Error executing Cypher query: ${error}`);
            throw error;
        } finally {
            await session.close();
        }
    }
}

module.exports = new Database();
