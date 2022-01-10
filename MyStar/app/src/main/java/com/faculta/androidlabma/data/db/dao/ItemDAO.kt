package com.faculta.androidlabma.data.db.dao

import androidx.room.*
import com.faculta.androidlabma.data.db.model.ItemDB

@Dao
interface ItemDAO {
    @Query("SELECT * FROM itemdb")
    fun getAll(): List<ItemDB>

    @Query("SELECT * FROM itemdb WHERE is_synced=0")
    fun getAllUnsynced(): List<ItemDB>

    @Insert
    fun addAll(vararg item: ItemDB)

    @Update
    fun update(item: ItemDB)

    @Delete
    fun delete(item: ItemDB)

    @Query("DELETE FROM itemdb")
    fun clearAll()

}