const axios = require('axios')
const moment = require('moment');

const API_GET = 'https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=0c260d78577f92e29433144ded26'
const API_POST = 'https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=0c260d78577f92e29433144ded26'

let uniqueCountries = new Set() // unique list of countries
let availableCountries = {} // main object that we will post to the API
availableCountries["countries"] = []

let countryDateCount = {} // object that holds dates for each country and each date holds an array of the partners from that country who are available on that day and the next
countryDateCount["countries"] = []

        axios.get(API_GET).then(response => {
            const data = response.data
            const partners = data.partners
        
        
        partners.forEach(partner => {
            let country = partner['country']
            if(!uniqueCountries.has(country)){
                uniqueCountries.add(country)
                countryDateCount["countries"][country] = {}
            }



            let partnerDates = partner['availableDates']
            // this filters out the consecutive dates only for the new array
            let consecutiveDates = partnerDates.filter((date, index, array) => {
                    return moment(date).diff(moment(array[index - 1]), 'days') === 1 || moment(date).diff(moment(array[index + 1]), 'days') === -1
            })
            
            // here the loop runs to less than 1 of the number of consecutive dates since the map of date:[partners] in the object for each country, holds only the start date
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
            //sorting the dates by length of the corresponding array to check which startDate is preferred by most partners for a particular country
            const [k,v] = sortedMap[Symbol.iterator]().next().value
            availableCountries["countries"].push({
                attendeeCount: v.length,
                attendees: v,
                name: country,
                startDate: k
            })
        })



            let value = JSON.stringify(availableCountries)
            let headers = {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            axios.post(API_POST, value, {headers: headers}).then(response=>{
                console.log(response.status)
            })

})

