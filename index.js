const axios = require('axios')
const moment = require('moment');

const API_GET = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=0c260d78577f92e29433144ded26'
const API_POST = ''

async function getData(){
    try{
        const response = await axios.get('https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=0c260d78577f92e29433144ded26')
        const data = await JSON.parse(response.body)
        const partners = data.partners
        console.log(partners)
    }catch(error){
        console.log('Error!')
    }
}


