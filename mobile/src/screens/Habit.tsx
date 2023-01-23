import { useRoute } from "@react-navigation/native";
import clsx from "clsx";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Alert, Button, ScrollView, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { CheckBox } from "../components/CheckBox";
import { HabitEmpty } from "../components/HabitEmpty";
import { Loading } from "../components/Loading";
import { ProgressBar } from "../components/ProgressBar";
import { api } from "../lib/axios";
import { generateProgressPercentage } from "../utils/generate-progress-percentage";

interface Params{
    date: string
}

interface DayInfoProps{
    completedHabits: string[]
    possibleHabits: {
        id: string;
        title: string;
    }[]
}

export function Habit(){

    const route = useRoute()
    const { date } = route.params as Params

    const parsedDate = dayjs(date)
    const isDateInPast = parsedDate.endOf('day').isBefore(new Date())
    const dayOfWeek = parsedDate.format('dddd')
    const dayAndMonth = parsedDate.format('DD/MM')

    const [ isLoading, setIsLoading ] = useState(true)
    const [ dayInfo, setDayInfo ] = useState<DayInfoProps | null>(null)
    const [ completedHabits, setCompletedHabits ] = useState<string[]>([])
    
    const habitsProgress = dayInfo?.possibleHabits.length 
        ? generateProgressPercentage(dayInfo.possibleHabits.length, completedHabits.length ) 
        : 0
    
    async function fetchHabits(){
        try {
            setIsLoading(true)
            
            const response = await api.get('/day', { params: { date } })
            
            setDayInfo(response.data)
            setCompletedHabits(response.data.completedHabits)
        } catch (error) {
            console.log(error);
            Alert.alert('Oops', 'Não foi possível carregar as informações dos hábitos.')    
        } finally {
            setIsLoading(false)
        }

    }

    async function handleToggleHabits(habitId: string) {
        
        try{
            await api.patch(`/habits/${habitId}/toggle`)
            
            if (completedHabits.includes(habitId)) {
                setCompletedHabits(prevState => prevState.filter(habit => habit !== habitId))
            } else{
                setCompletedHabits(prevState => [ ...prevState, habitId ])
            }
        } catch (error){
            console.log(error);
            Alert.alert('Oops', 'Não foi possível atualizar o status do hábito.')
        }
    }

    useEffect(() => {
        fetchHabits()
    },[])

    if(isLoading){
        return <Loading/>
    }

    return(
        <View
            className="flex-1 bg-background px-8 pt-16"
            >
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                >
                <BackButton/>

                <Text className="mt-6 text-zinc-400 font-semibold text-base lowercase">
                    {dayOfWeek}
                </Text>

                <Text className="text-white font-extrabold text-3xl">
                    {dayAndMonth}
                </Text>

                <ProgressBar
                    progress={habitsProgress}
                    />

                <View className={clsx("mt-6", {
                    ['opacity-30']: isDateInPast
                })}>
                    
                    {
                        dayInfo!.possibleHabits.length > 0 ?
                            dayInfo?.possibleHabits.map(habit => (
                                <CheckBox 
                                    key={habit.id}
                                    title={habit.title} 
                                    checked={completedHabits.includes(habit.id)}
                                    disabled={isDateInPast}
                                    onPress={() => handleToggleHabits(habit.id)}
                                    />
                            ))
                        : <HabitEmpty/>
                    }
                </View>

                {
                    isDateInPast && 
                        <Text className="text-white mt-10 text-center">
                            Você não pode editar hábitos de uma data passada
                        </Text>
                }
            </ScrollView>
        </View>
    )
}