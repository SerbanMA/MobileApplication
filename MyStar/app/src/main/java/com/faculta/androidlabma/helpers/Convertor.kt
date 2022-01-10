package com.faculta.androidlabma.helpers

import com.faculta.androidlabma.data.db.model.ItemDB
import com.faculta.androidlabma.data.models.Item

object Convertor {
    fun convertFromItemDbToItem(items: List<ItemDB>): List<Item> {
        val newList = arrayListOf<Item>()
        items.forEach {
            newList.add(Item(it._id, it.name, it.date, it.rating, it.favourite))
        }
        return newList
    }

    fun convertFromItemDbToItem(item: ItemDB): Item {
        return Item(item._id, item.name, item.date, item.rating, item.favourite)
    }

    fun convertFromItemToItemDb(items: List<Item>, isSynced: Boolean): List<ItemDB> {
        val newList = arrayListOf<ItemDB>()
        items.forEach {
            newList.add(ItemDB(_id = it._id?: "", name = it.name, date = it.date, rating = it.rating, favourite = it.favourite, isSynced = isSynced))
        }
        return newList
    }

    fun convertFromItemToItemDb(item: Item, isSynced: Boolean): ItemDB {
        return ItemDB(_id = item._id?: "", name = item.name, date = item.date, rating = item.rating, favourite = item.favourite, isSynced = isSynced)
    }
}