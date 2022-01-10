package com.faculta.androidlabma.helpers

import androidx.room.TypeConverter
import java.text.SimpleDateFormat
import java.util.*

object DateUtils {
    private const val pattern = "dd/MM/yyyy HH:mm:ss"
    fun getStringFromDate(date: Date): String {
        val dateFormat = SimpleDateFormat(pattern)
        return dateFormat.format(date)
    }

    class DateConverter {
        @TypeConverter
        fun toDate(dateLong: Long?): Date? {
            return dateLong?.let { Date(it) }
        }

        @TypeConverter
        fun fromDate(date: Date?): Long? {
            return date?.time
        }
    }
}