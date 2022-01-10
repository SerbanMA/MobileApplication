package com.faculta.androidlabma.ui.adapter

import android.content.Context
import android.view.View
import androidx.recyclerview.widget.RecyclerView
import com.faculta.androidlabma.R
import com.faculta.androidlabma.data.db.model.ItemDB
import com.faculta.androidlabma.databinding.ViewHolderItemBinding
import com.faculta.androidlabma.helpers.DateUtils
import java.util.*

class ObjectListViewHolder(private val binding: ViewHolderItemBinding): RecyclerView.ViewHolder(binding.root) {
    fun bindData(item: ItemDB, context: Context) {
        binding.nameTextView.text = context.getString(R.string.name_string, item.name?: "")
        binding.dateTextView.text = context.getString(R.string.date_string, DateUtils.getStringFromDate(item.date?: Date(System.currentTimeMillis())))
        binding.ratingTextView.text = context.getString(R.string.rating_string, item.rating?: "")

        if (item.favourite == true) {
            binding.starImageView.visibility = View.VISIBLE
        } else {
            binding.starImageView.visibility = View.GONE
        }
    }

}