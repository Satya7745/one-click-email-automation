package com.satya.localassistant

import android.Manifest
import android.app.Activity
import android.provider.AlarmClock
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.view.Gravity
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import java.util.Locale

class MainActivity : Activity() {
    private val bg = Color.rgb(11, 16, 32)
    private val panel = Color.rgb(24, 32, 53)
    private val accent = Color.rgb(110, 142, 255)
    private val white = Color.rgb(245, 247, 255)
    private val muted = Color.rgb(174, 184, 207)
    private lateinit var input: EditText
    private lateinit var status: TextView
    private var speech: SpeechRecognizer? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = bg
        window.navigationBarColor = bg
        buildScreen()
    }

    private fun buildScreen() {
        val scroll = ScrollView(this).apply { setBackgroundColor(bg) }
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(22), dp(28), dp(22), dp(24))
        }
        scroll.addView(root)

        root.addView(text("PERSONAL • ON-DEVICE", 12f, accent, true), match())
        root.addView(space(8))
        root.addView(text("Pocket Assistant", 30f, white, true), match())
        root.addView(space(8))
        root.addView(text(
            "A private first version for voice commands and everyday phone actions.",
            15f, muted, false
        ), match())
        root.addView(space(18))

        val info = card()
        info.addView(text("PRIVACY FIRST", 12f, accent, true), match())
        info.addView(space(6))
        info.addView(text(
            "Command matching stays on this phone. This prototype has no AI model yet. " +
                "Voice works only when an on-device speech service and offline language data are available.",
            13f, muted, false
        ), match())
        root.addView(info, match())
        root.addView(space(20))
        root.addView(text("What should I do?", 18f, white, true), match())
        root.addView(space(10))

        input = EditText(this).apply {
            setSingleLine(true)
            hint = "Try: open YouTube"
            setTextColor(white)
            setHintTextColor(Color.rgb(130, 143, 170))
            textSize = 16f
            setPadding(dp(14), dp(13), dp(14), dp(13))
            background = rounded(Color.rgb(31, 41, 66), dp(14))
        }
        root.addView(input, match())
        root.addView(space(10))

        val controls = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        controls.addView(button("Speak", accent) { startOfflineSpeech() },
            LinearLayout.LayoutParams(0, dp(50), 1f).apply { marginEnd = dp(6) })
        controls.addView(button("Run command", panel) { runCommand(input.text.toString()) },
            LinearLayout.LayoutParams(0, dp(50), 1f).apply { marginStart = dp(6) })
        root.addView(controls, match())
        root.addView(space(20))
        root.addView(text("Quick actions", 18f, white, true), match())
        root.addView(space(10))

        listOf(
            listOf("Settings" to "open settings", "YouTube" to "open youtube"),
            listOf("WhatsApp" to "open whatsapp", "Chrome" to "open chrome"),
            listOf("Wi-Fi settings" to "open wifi settings", "Bluetooth" to "open bluetooth settings"),
            listOf("Accessibility" to "open accessibility settings", "Help" to "help")
        ).forEach { items ->
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
            items.forEachIndexed { index, item ->
                row.addView(button(item.first, panel) { runCommand(item.second) },
                    LinearLayout.LayoutParams(0, dp(48), 1f).apply {
                        if (index == 0) marginEnd = dp(6) else marginStart = dp(6)
                    })
            }
            root.addView(row, match())
            root.addView(space(8))
        }

        root.addView(space(10))
        val resultCard = card()
        resultCard.addView(text("STATUS", 12f, accent, true), match())
        resultCard.addView(space(8))
        status = text("Ready. Type a command or choose a quick action.", 15f, white, false)
        resultCard.addView(status, match())
        root.addView(resultCard, match())
        root.addView(space(14))
        root.addView(text(
            "Not included yet: LLM reasoning, screen-tap automation, or wake-word activation.",
            12f, muted, false
        ), match())
        setContentView(scroll)
    }

    private fun runCommand(raw: String) {
        val cmd = raw.trim().lowercase(Locale.ROOT)
        if (cmd.isBlank()) { show("Enter a command first."); return }
        try {
            when {
                cmd in setOf("help", "commands", "what can you do") ->
                    show("Try: open Settings, YouTube, WhatsApp, Chrome; open Wi-Fi settings; " +
                        "open Bluetooth settings; or set alarm for 19:30.")
                cmd in setOf("open settings", "open phone settings", "open system settings") -> {
                    launch(Intent(Settings.ACTION_SETTINGS)); show("Opened Android Settings.")
                }
                cmd.contains("wifi") || cmd.contains("wi-fi") -> {
                    launch(Intent(Settings.ACTION_WIFI_SETTINGS))
                    show("Opened Wi-Fi settings. Change the switch there.")
                }
                cmd.contains("bluetooth") -> {
                    launch(Intent(Settings.ACTION_BLUETOOTH_SETTINGS))
                    show("Opened Bluetooth settings. Change the switch there.")
                }
                cmd.contains("accessibility settings") -> {
                    launch(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
                    show("Opened Accessibility settings. UI automation is not included yet.")
                }
                cmd.startsWith("open ") -> openApp(cmd.removePrefix("open ").trim())
                cmd.startsWith("set alarm") || cmd.startsWith("alarm for") -> setAlarm(cmd)
                else -> show("I don't know that command yet. This prototype uses a small local command list, not an AI model. Tap Help for examples.")
            }
        } catch (_: SecurityException) {
            show("Android denied the action. Check permissions and device settings.")
        } catch (e: Exception) {
            show("Action failed: " + (e.message ?: e.javaClass.simpleName))
        }
    }

    private fun openApp(nameRaw: String) {
        val name = nameRaw.removePrefix("the ").trim()
        if (name == "settings") {
            launch(Intent(Settings.ACTION_SETTINGS)); show("Opened Android Settings."); return
        }
        val packages = mapOf(
            "youtube" to "com.google.android.youtube",
            "whatsapp" to "com.whatsapp",
            "chrome" to "com.android.chrome",
            "gmail" to "com.google.android.gm",
            "maps" to "com.google.android.apps.maps",
            "google maps" to "com.google.android.apps.maps",
            "photos" to "com.google.android.apps.photos"
        )
        val pkg = packages[name]
        if (pkg == null) { show("Supported apps: YouTube, WhatsApp, Chrome, Gmail, Maps, Photos and Settings."); return }
        val intent = packageManager.getLaunchIntentForPackage(pkg)
        if (intent == null) { show(name + " is not installed or is unavailable."); return }
        launch(intent)
        show("Requested launch of " + name + ".")
    }

    private fun setAlarm(command: String) {
        val time = command.substringAfter(" for ", "").trim()
        val h24 = Regex("^(\\d{1,2}):(\\d{2})$").matchEntire(time)
        var hour: Int
        var minute: Int
        if (h24 != null) {
            hour = h24.groupValues[1].toInt()
            minute = h24.groupValues[2].toInt()
        } else {
            val h12 = Regex("^(\\d{1,2})\\s*(am|pm)$").matchEntire(time)
            if (h12 == null) { show("Use: set alarm for 19:30 or set alarm for 7 pm."); return }
            hour = h12.groupValues[1].toInt()
            if (hour !in 1..12) { show("Invalid 12-hour alarm time."); return }
            hour = (hour % 12) + if (h12.groupValues[2] == "pm") 12 else 0
            minute = 0
        }
        if (hour !in 0..23 || minute !in 0..59) { show("Invalid alarm time."); return }
        val intent = Intent(AlarmClock.ACTION_SET_ALARM).apply {
            putExtra(AlarmClock.EXTRA_HOUR, hour)
            putExtra(AlarmClock.EXTRA_MINUTES, minute)
            putExtra(AlarmClock.EXTRA_MESSAGE, "Pocket Assistant")
        }
        if (intent.resolveActivity(packageManager) == null) { show("No compatible clock app found."); return }
        launch(intent)
        show("Opened Clock to create %02d:%02d. Confirm and save the alarm there.".format(hour, minute))
    }

    private fun launch(intent: Intent) {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        startActivity(intent)
    }

    private fun startOfflineSpeech() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) {
            show("Offline speech in this prototype requires Android 12+. Type a command instead."); return
        }
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(arrayOf(Manifest.permission.RECORD_AUDIO), 101); return
        }
        if (!SpeechRecognizer.isOnDeviceRecognitionAvailable(this)) {
            show("No on-device speech service is available. For privacy, this app will not fall back to cloud speech. Type a command instead."); return
        }
        try {
            speech?.destroy()
            speech = SpeechRecognizer.createOnDeviceSpeechRecognizer(this)
            speech?.setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) { show("Listening on device…") }
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onError(error: Int) { show("Offline speech failed (code $error). Type a command or try again.") }
                override fun onResults(results: Bundle?) {
                    val spoken = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                    if (spoken.isNullOrBlank()) show("I didn't catch that. Try again or type a command.")
                    else { input.setText(spoken); runCommand(spoken) }
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, "en-IN")
                putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
            }
            speech?.startListening(intent)
        } catch (e: Exception) { show("Could not start offline speech: " + (e.message ?: "service unavailable")) }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, results: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, results)
        if (requestCode == 101) {
            if (results.firstOrNull() == PackageManager.PERMISSION_GRANTED) startOfflineSpeech()
            else show("Microphone permission denied. Type a command instead.")
        }
    }

    private fun show(message: String) { if (::status.isInitialized) status.text = message }

    private fun text(value: String, size: Float, color: Int, bold: Boolean) = TextView(this).apply {
        text = value; textSize = size; setTextColor(color)
        if (bold) setTypeface(typeface, Typeface.BOLD)
        setLineSpacing(dp(2).toFloat(), 1f)
    }

    private fun button(label: String, color: Int, click: () -> Unit) = Button(this).apply {
        text = label; textSize = 13f; isAllCaps = false
        setTextColor(white); typeface = Typeface.DEFAULT_BOLD
        background = rounded(color, dp(14)); stateListAnimator = null
        setOnClickListener { click() }
    }

    private fun card() = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(dp(16), dp(16), dp(16), dp(16))
        background = rounded(panel, dp(18))
    }

    private fun rounded(color: Int, radius: Int) = GradientDrawable().apply {
        setColor(color); cornerRadius = radius.toFloat()
    }

    private fun space(height: Int) = View(this).apply {
        layoutParams = LinearLayout.LayoutParams(1, dp(height))
    }

    private fun match() = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT
    )
    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

    override fun onDestroy() {
        try { speech?.cancel(); speech?.destroy() } catch (_: Exception) {}
        speech = null
        super.onDestroy()
    }
}
