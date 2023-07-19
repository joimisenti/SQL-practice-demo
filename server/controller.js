require('dotenv').config()
const {CONNECTION_STRING} = process.env
const Sequelize = require('sequelize')

// you wouldn't want to rejectUnauthorized in a production app, but it's great for practice
const sequelize = new Sequelize(CONNECTION_STRING, {
    dialect: 'postgres', 
    dialectOptions: {
        ssl: {
            rejectUnauthorized: false
        }
    }
});

// we are mocking a user sign-in: Fern
const userId = 4
const clientId = 3

module.exports = {
    getUserInfo: (req, res) => {
        sequelize.query(`
        SELECT * from cc_clients AS c
        JOIN cc_users AS u
        ON c.user_id = u.user_id
        WHERE u.user_id = ${userId};
        `)
        .then(dbRes => {
            console.log(dbRes)
            res.status(200).send(dbRes[0])
        })
        .catch(err => console.log(err))
    },
    updateUserInfo: (req, res) => {
        let { firstName,
            lastName,
            phoneNumber,
            email,
            address,
            city,
            state,
            zipCode }
            = req.body

        sequelize.query(`
            UPDATE cc_users SET
            first_name = '${firstName}',
            last_name = '${lastName}',
            phone_number = ${phoneNumber},
            email = '${email}'
            WHERE user_id = ${userId};

            update cc_clients SET
            address = '${address}',
            city = '${city}',
            state = '${state}',
            zip_code = ${zipCode}
            WHERE user_id = ${userId};
        `)
        .then(dbRes => res.sendStatus(200))
        .catch(err => console.log(err))
    },
    getUserAppt: (req, res) => {
        sequelize.query(`
            SELECT * from cc_appointments
            WHERE client_id = ${clientId}
            ORDER BY date desc;
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    },
    requestAppointment: (req, res) => {
        const { date, service } = req.body;
        sequelize.query(`
            INSERT INTO cc_appointments (client_id, date, service_type, notes, approved, completed) VALUES (${clientId}, '${date}', '${service}', 'Please help us. Its urgent.', false, false)
            returning *;
        `)
        .then(dbRes => res.status(200).send(dbRes[0]))
        .catch(err => console.log(err))
    }
}