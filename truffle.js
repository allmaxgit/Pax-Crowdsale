module.exports = {
    migrations_directory: './migrations',
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    },
    networks: {
        development: {
            host: 'localhost',
            port: 9545,
            network_id: '*' // Match any network id
        }
    }
};
