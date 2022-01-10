package com.faculta.androidlabma.ui

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.navigation.fragment.findNavController
import com.faculta.androidlabma.R
import com.faculta.androidlabma.databinding.FragmentLoginBinding
import com.faculta.androidlabma.helpers.showToast
import com.faculta.androidlabma.ui.viewmodel.LoginViewModel

class LoginFragment : Fragment(), SensorEventListener {
    private lateinit var binding: FragmentLoginBinding
    private lateinit var sensorManager: SensorManager
    private var sensor: Sensor? = null

    private val viewModel = LoginViewModel()
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        binding = FragmentLoginBinding.inflate(inflater, container, false)
        sensorManager = requireActivity().getSystemService(Context.SENSOR_SERVICE) as SensorManager
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {

        sensor = sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT)

        binding.loginButton.setOnClickListener {
            val userName = binding.usernameInputTIET.text.toString()
            val password = binding.passwordInputTIET.text.toString()
            viewModel.login(userName, password, requireActivity() as MainActivity)
        }

        binding.registerButton.setOnClickListener {
            findNavController().navigate(R.id.action_loginFragment_to_registerFragment)
        }

        viewModel.errorMessageLiveData.observe(viewLifecycleOwner, {
            requireContext().showToast(it)
        })

        viewModel.canNavigateToNextDestination.observe(viewLifecycleOwner, {
            if (it) {
                Log.d("LoginFragment", (requireActivity() as MainActivity).getToken() ?: "")

                val direction = LoginFragmentDirections.actionLoginFragmentToObjectListFragment()
                findNavController().navigate(direction)
                viewModel.canNavigateToNextDestination.value = false
            }
        })


    }

    override fun onSensorChanged(event: SensorEvent) {
        val lux = event.values[0]
        binding.sensorTextView.text = "Light sensor: $lux"
    }

    override fun onAccuracyChanged(p0: Sensor?, p1: Int) {
        Log.d("LoginFragment", "onAccuracyChanged $p1");
    }

    override fun onResume() {
        super.onResume()
        sensor?.also {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
        }
    }

    override fun onPause() {
        super.onPause()
        sensorManager.unregisterListener(this)
    }
}