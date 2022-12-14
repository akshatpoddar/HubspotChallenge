const axios = require('axios')
const moment = require('moment');

const API_GET = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=0c260d78577f92e29433144ded26'
const API_POST = 'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=0c260d78577f92e29433144ded26'

let uniqueCountries = new Set()
let availableCountries = {}
availableCountries["countries"] = []

let startDateMap = new Map()
let countryDateCount = {}
countryDateCount["countries"] = []

async function getData(){
    try{
        const response = await axios.get(API_GET)
        const data = response.data
        const partners = data.partners

        partners.forEach(partner => {
            let country = partner['country']
            if(!uniqueCountries.has(country)){
                uniqueCountries.add(country)
                countryDateCount["countries"][country] = {}
            }



            let partnerDates = partner['availableDates']

            let consecutiveDates = partnerDates.filter((date, index, array) => {
                    return moment(date).diff(moment(array[index - 1]), 'days') === 1 || moment(date).diff(moment(array[index + 1]), 'days') === -1
            })
            

            if(consecutiveDates.length > 1){
                for (let i = 0; i < consecutiveDates.length - 1; i++){
                    let date = consecutiveDates[i]
                    if(!countryDateCount["countries"][country][date]){
                        let value = []
                        value.push(partner.email)
                        countryDateCount["countries"][country][date] = value
                    }else{
                        let value = countryDateCount["countries"][country][date]
                        value.push(partner.email)
                        countryDateCount["countries"][country][date] = value
                    }
                }
            }



        })

        uniqueCountries.forEach(country => {
            // going through each countries' map of dates:partners
            let map = new Map(Object.entries(countryDateCount["countries"][country]))
            let sortedMap = new Map([...map].sort((a, b) => b[1].length - a[1].length));
            const [k,v] = sortedMap[Symbol.iterator]().next().value
            availableCountries["countries"].push({
                attendeeCount: v.length,
                attendees: v,
                name: country,
                startDate: k
            })

            
            
        })
    }catch(error){
        console.log(error)
    }
}


getData()
console.log(availableCountries)
sendData = async () => {
    try{
        let value = JSON.stringify(availableCountries)
        let headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        const res = await axios.post(API_POST, value, {headers: headers})
        console.log(res.status)
    }catch(error){
        console.log(error)
    }
       
}

// sendData()



