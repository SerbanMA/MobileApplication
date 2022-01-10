package com.faculta.androidlabma.data.db.model

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverters
import com.faculta.androidlabma.helpers.DateUtils
import java.io.Serializable
import java.util.*

@Entity
@TypeConverters(DateUtils.DateConverter::class)
data class ItemDB(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    @ColumnInfo(name = "_id" ) var _id: String? = null,
    @ColumnInfo(name = "name") var name: String? = null,
    @ColumnInfo(name = "date") var date: Date? = null,
    @ColumnInfo(name = "rating") var rating: Int? = null,
    @ColumnInfo(name = "favourite") var favourite: Boolean? = null,
    @ColumnInfo(name = "is_synced") var isSynced: Boolean? = null
): Serializable
