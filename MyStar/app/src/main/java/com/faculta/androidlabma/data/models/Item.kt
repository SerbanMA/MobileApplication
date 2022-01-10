package com.faculta.androidlabma.data.models

import java.io.Serializable
import java.util.*

data class Item(
    val _id: String? = null,
    val name: String? = null,
    val date: Date? = null,
    val rating: Int? = null,
    val favourite: Boolean? = null
): Serializable
