package com.faculta.androidlabma.application

import android.app.Application
import com.facebook.flipper.plugins.inspector.DescriptorMapping

import com.facebook.flipper.plugins.inspector.InspectorFlipperPlugin

import com.facebook.flipper.android.AndroidFlipperClient

import com.facebook.flipper.android.utils.FlipperUtils

import com.facebook.soloader.SoLoader
import com.faculta.androidlabma.BuildConfig


class Application: Application() {
    override fun onCreate() {
        super.onCreate()

        SoLoader.init(this, false)

        if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(this)) {
            val client = AndroidFlipperClient.getInstance(this)
            client.addPlugin(InspectorFlipperPlugin(this, DescriptorMapping.withDefaults()))
            client.start()
        }
    }
}