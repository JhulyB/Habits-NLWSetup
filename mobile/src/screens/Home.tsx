import { useFocusEffect, useNavigation } from "@react-navigation/native";
import dayjs from "dayjs";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { DAY_SIZE, HabitDay } from "../components/HabitDay";
import { Header } from "../components/Header";
import { Loading } from "../components/Loading";
import { api } from "../lib/axios";
import { generateDatesFromYearBeginning } from "../utils/generate-dates-from-year-beginning";

const weekDays = [
    'D',
    'S',
    'T',
    'Q',
    'Q',
    'S',
    'S'
]

const datesFromYearStart = generateDatesFromYearBeginning()
const minimumSumaryDatesSizes = 18 * 5;
const amountDaysToFill = minimumSumaryDatesSizes - datesFromYearStart.length

type SummaryProps = Array<{
    id: string
    date: string
    amount: number
    completed: number
}>

export function Home(){

    const { navigate } = useNavigation()
    
    const [ isLoading, setIsLoading ] = useState(true)
    const [ summary, setSummary ] = useState<SummaryProps | null>(null)
    
    async function fetchData() {
        try {
            setIsLoading(true)
            
            const response = await api.get('/summary')
            setSummary(response.data)
            
        } catch (error) {
            Alert.alert('Oops', 'Não foi possível carregar o sumário de hábitos.')
            console.log(error);
            
        } finally {
            setIsLoading(false)
        }
    }

    useFocusEffect(useCallback(() => {
        fetchData()
    },[]))

    if (isLoading) {
        return <Loading/>
    }

    return(
        <View className="flex-1 bg-background px-8 pt-8">
            <Header/>

                <View className="flex-row mt-6 mb-2">
                    {
                        weekDays.map((weekDay, i) => (
                            <Text 
                                key={`${weekDay}-${i}`}
                                className="text-zinc-400 text-xl font-bold text-center mx-1"
                                style={{width: DAY_SIZE}}
                                >
                                {weekDay}
                            </Text>
                        ))
                    }
                </View>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    >
                    {
                        summary &&
                        <View className="flex-row flex-wrap">

                            {
                                datesFromYearStart.map((date) => {
                                    const dayWithHabits = summary.find(day => {
                                        return dayjs(date).isSame(day.date, 'day')
                                    })
                                    
                                    return(
                                        <HabitDay 
                                            date={date}
                                            amountOfHabits={dayWithHabits?.amount}
                                            amountCompleted={dayWithHabits?.completed}
                                            key={date.toISOString()}
                                            onPress={() => navigate('habit', { date: date.toISOString() })}
                                            />
                                    )
                                })
                            }

                            {
                                amountDaysToFill > 0 && Array
                                    .from({ length: amountDaysToFill })
                                    .map((_,index) => (
                                        <View
                                            className="bg-zinc-900 rounded-lg border-2 m-1 border-zinc-800 opacity-40"
                                            style={{ width: DAY_SIZE, height: DAY_SIZE}}
                                            />                
                                    ))
                            }
                        </View>
                    }

                </ScrollView>

        </View>
    )
}