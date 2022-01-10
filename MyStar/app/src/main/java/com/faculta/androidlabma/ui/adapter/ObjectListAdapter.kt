package com.faculta.androidlabma.ui.adapter

import android.content.Context
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.RecyclerView
import com.faculta.androidlabma.data.db.model.ItemDB
import com.faculta.androidlabma.databinding.ViewHolderItemBinding

class ObjectListAdapter(
    private val context: Context,
    private var items: List<ItemDB>,
    private var onClick: (ItemDB) -> Unit
): RecyclerView.Adapter<ObjectListViewHolder>() {
    override fun getItemCount(): Int {
        return items.size
    }

    override fun onBindViewHolder(holder: ObjectListViewHolder, position: Int) {
        val item = items[position]
        holder.itemView.setOnClickListener {
            onClick.invoke(item)
        }
        holder.bindData(item, context)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ObjectListViewHolder {
        return ObjectListViewHolder(ViewHolderItemBinding.inflate(LayoutInflater.from(context), parent, false))
    }
}