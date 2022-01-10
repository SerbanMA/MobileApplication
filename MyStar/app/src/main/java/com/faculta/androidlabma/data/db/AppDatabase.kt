package com.faculta.androidlabma.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.faculta.androidlabma.data.db.dao.ItemDAO
import com.faculta.androidlabma.data.db.model.ItemDB

@Database(entities = [ItemDB::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun itemDAO(): ItemDAO

    companion object {
        // For Singleton instantiation
        @Volatile
        private var instance: AppDatabase? = null

        fun getInstance(context: Context): AppDatabase {
            return instance ?: synchronized(this) {
                instance ?: buildDatabase(context).also { instance = it }
            }
        }

        private fun buildDatabase(context: Context) =
            Room.databaseBuilder(context, AppDatabase::class.java, "itemdb")
                .build()
    }
}