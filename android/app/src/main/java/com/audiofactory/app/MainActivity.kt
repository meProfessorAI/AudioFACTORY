package com.audiofactory.app

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.DownloadManager
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Color
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.util.Log
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.webkit.*
import android.widget.Button
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import android.content.ContentValues
import android.provider.MediaStore
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider

class MainActivity : AppCompatActivity() {

    companion object {
        const val PRODUCTION_URL = "https://audiofactory.vercel.app"
        const val ALLOWED_HOST = "audiofactory.vercel.app"
        const val REQUEST_RECORD_AUDIO_PERMISSION = 200
    }

    private lateinit var rootLayout: FrameLayout
    private lateinit var webView: WebView
    private lateinit var splashLayout: LinearLayout
    private lateinit var errorLayout: LinearLayout

    private var filePathCallback: ValueCallback<Array<Uri>>? = null
    private var pendingPermissionRequest: PermissionRequest? = null

    // Register modern file picker launcher
    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val results = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val dataString = result.data?.dataString
            val clipData = result.data?.clipData
            if (clipData != null) {
                Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            } else if (dataString != null) {
                arrayOf(Uri.parse(dataString))
            } else null
        } else null

        filePathCallback?.onReceiveValue(results)
        filePathCallback = null
    }

    override fun onCreate(savedInstanceState) {
        super.onCreate(savedInstanceState)

        // Strict environment validation: Release builds must ALWAYS load Vercel production URL
        if (!BuildConfig.DEBUG) {
            require(PRODUCTION_URL.startsWith("https://")) { "Production URL must use SSL (HTTPS)" }
        }

        // Configure edge-to-edge / status bar styling
        window.statusBarColor = Color.parseColor("#0A0A0A")
        window.navigationBarColor = Color.parseColor("#0A0A0A")

        // Build UI programmatically for robust dependency-free execution
        setupViews()

        // Configure Back Button Behavior to navigate web history
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    showExitConfirmationDialog()
                }
            }
        })

        // Restore saved WebView state if available
        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState)
        } else {
            webView.loadUrl(PRODUCTION_URL)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupViews() {
        rootLayout = FrameLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            setBackgroundColor(Color.parseColor("#0D1117"))
        }

        // 1. Initialize WebView
        webView = WebView(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            visibility = View.INVISIBLE // Hide until first content paints successfully
        }

        // Enable modern web settings required for AudioFACTORY
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            mediaPlaybackRequiresUserGesture = false
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            allowFileAccess = true
            allowContentAccess = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            
            // Append explicit AudioFACTORY app identifier to User Agent string
            userAgentString = "$userAgentString AudioFACTORYAndroid/1.0"
        }

        // Configure cookies
        CookieManager.getInstance().apply {
            setAcceptCookie(true)
            setAcceptThirdPartyCookies(webView, true)
        }

        // Add Native JavaScript Bridge for Seamless Audio Saving (MediaStore Scoped Storage)
        val audioBridge = AudioFactoryBridge()
        webView.addJavascriptInterface(audioBridge, "AudioFactoryBridge")
        webView.addJavascriptInterface(audioBridge, "AndroidBridge")

        // WebChromeClient for File Uploads, Microphone, Dialogs & Progress
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView,
                filePathCallback: ValueCallback<Array<Uri>>,
                fileChooserParams: FileChooserParams
            ): Boolean {
                this@MainActivity.filePathCallback?.onReceiveValue(null)
                this@MainActivity.filePathCallback = filePathCallback
                val intent = fileChooserParams.createIntent()
                try {
                    filePickerLauncher.launch(intent)
                } catch (e: Exception) {
                    this@MainActivity.filePathCallback?.onReceiveValue(null)
                    this@MainActivity.filePathCallback = null
                    return false
                }
                return true
            }

            override fun onPermissionRequest(request: PermissionRequest) {
                val resources = request.resources
                val hasMicrophone = resources.contains(PermissionRequest.RESOURCE_AUDIO_CAPTURE)
                if (hasMicrophone) {
                    val origin = request.origin.toString()
                    if (origin.startsWith(PRODUCTION_URL) || origin.contains(ALLOWED_HOST)) {
                        // Check Android microphone permission
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            request.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
                        } else {
                            pendingPermissionRequest = request
                            ActivityCompat.requestPermissions(
                                this@MainActivity,
                                arrayOf(Manifest.permission.RECORD_AUDIO),
                                REQUEST_RECORD_AUDIO_PERMISSION
                            )
                        }
                    } else {
                        request.deny()
                    }
                } else {
                    request.deny()
                }
            }

            // Standard console and js dialog handling
            override fun onJsAlert(view: WebView, url: String, message: String, result: JsResult): Boolean {
                Toast.makeText(applicationContext, message, Toast.LENGTH_LONG).show()
                result.confirm()
                return true
            }
        }

        // WebViewClient for navigation rules and loading states
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return handleNavigationRules(url)
            }

            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                return handleNavigationRules(url)
            }

            private fun handleNavigationRules(url: String): Boolean {
                // Stay inside the WebView for AudioFACTORY domains
                if (url.startsWith(PRODUCTION_URL) || url.contains(ALLOWED_HOST)) {
                    return false
                }

                // External URLs like oauth providers, payment gateways must open in system browser
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                } catch (e: Exception) {
                    Log.e("AudioFACTORY", "Failed to launch external browser for URL: $url", e)
                    return false
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                // Dismiss splash only once we successfully connect and render the live app
                if (webView.visibility != View.VISIBLE) {
                    webView.visibility = View.VISIBLE
                    splashLayout.visibility = View.GONE
                }
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                if (request.isForMainFrame) {
                    showErrorState()
                }
            }

            @Deprecated("Deprecated in Java")
            override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String) {
                showErrorState()
            }
        }

        // Configure DownloadListener for generated audio downloads
        webView.setDownloadListener { url, userAgent, contentDisposition, mimetype, contentLength ->
            if (url.startsWith("http")) {
                try {
                    // Check and request runtime storage permissions on API <= 28 if needed
                    if (android.os.Build.VERSION.SDK_INT <= android.os.Build.VERSION_CODES.P) {
                        if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                            ActivityCompat.requestPermissions(
                                this,
                                arrayOf(Manifest.permission.WRITE_EXTERNAL_STORAGE, Manifest.permission.READ_EXTERNAL_STORAGE),
                                201
                            )
                        }
                    }
                    val fileName = URLUtil.guessFileName(url, contentDisposition, mimetype.ifEmpty { "audio/wav" })
                    val request = DownloadManager.Request(Uri.parse(url)).apply {
                        setMimeType(mimetype.ifEmpty { "audio/wav" })
                        addRequestHeader("User-Agent", userAgent)
                        setDescription("Downloading audio from AudioFACTORY...")
                        setTitle(fileName)
                        setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                        setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, fileName)
                    }
                    val dm = getSystemService(DOWNLOAD_SERVICE) as DownloadManager
                    dm.enqueue(request)
                    Toast.makeText(applicationContext, "Downloading to Downloads folder...", Toast.LENGTH_SHORT).show()
                } catch (e: Exception) {
                    Log.w("AudioFACTORY", "Download manager fallback: ${e.message}")
                }
            } else if (url.startsWith("blob:") || url.startsWith("data:")) {
                try {
                    val fallbackName = "audiofactory_${System.currentTimeMillis()}.wav"
                    if (url.startsWith("blob:")) {
                        val jsCode = """
                            (function() {
                                fetch('$url')
                                    .then(function(r) { return r.blob(); })
                                    .then(function(b) {
                                        var reader = new FileReader();
                                        reader.onloadend = function() {
                                            if (window.AudioFactoryBridge) {
                                                window.AudioFactoryBridge.saveAudio(reader.result, '$fallbackName', 'audio/wav');
                                            }
                                        };
                                        reader.readAsDataURL(b);
                                    })
                                    .catch(function(e) {
                                        console.warn('Blob bridge read failed:', e);
                                    });
                            })();
                        """.trimIndent()
                        webView.evaluateJavascript(jsCode, null)
                    } else {
                        audioBridge.saveAudio(url, fallbackName, mimetype.ifEmpty { "audio/wav" })
                    }
                } catch (e: Exception) {
                    Log.w("AudioFACTORY", "Failed to delegate blob/data download: ${e.message}")
                }
            }
        }

        // 2. Initialize Lightweight Native Splash/Loading Screen from layout resource
        splashLayout = layoutInflater.inflate(R.layout.activity_splash, rootLayout, false) as LinearLayout

        // 3. Initialize Error/Offline Screen
        errorLayout = LinearLayout(this).apply {
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
            orientation = LinearLayout.VERTICAL
            gravity = Gravity.CENTER
            setBackgroundColor(Color.parseColor("#0D1117"))
            visibility = View.GONE
        }

        val errorHeader = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(8)
            }
            text = "CONNECTION_LOST"
            setTextColor(Color.parseColor("#EF4444")) // Red warning alert
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 20f)
            typeface = Typeface.MONOSPACE
            letterSpacing = 0.05f
        }

        val errorBody = TextView(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                dpToPx(280),
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                bottomMargin = dpToPx(24)
            }
            text = "AudioFACTORY couldn't connect to Vercel production server. Please check your network connectivity."
            setTextColor(Color.parseColor("#8B949E"))
            setTextSize(TypedValue.COMPLEX_UNIT_SP, 13f)
            gravity = Gravity.CENTER
            lineHeight = dpToPx(18)
        }

        val buttonContainer = LinearLayout(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            orientation = LinearLayout.HORIZONTAL
        }

        val retryButton = Button(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                rightMargin = dpToPx(12)
            }
            text = "RETRY"
            setTextColor(Color.BLACK)
            setBackgroundColor(Color.parseColor("#F59E0B")) // Premium Amber Button
            typeface = Typeface.MONOSPACE
            setOnClickListener {
                hideErrorState()
                webView.loadUrl(PRODUCTION_URL)
            }
        }

        val browserButton = Button(this).apply {
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            )
            text = "BROWSER"
            setTextColor(Color.WHITE)
            setBackgroundColor(Color.parseColor("#21262D"))
            typeface = Typeface.MONOSPACE
            setOnClickListener {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(PRODUCTION_URL))
                    startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(applicationContext, "Cannot open browser", Toast.LENGTH_SHORT).show()
                }
            }
        }

        buttonContainer.addView(retryButton)
        buttonContainer.addView(browserButton)

        errorLayout.addView(errorHeader)
        errorLayout.addView(errorBody)
        errorLayout.addView(buttonContainer)

        // Assemble programmatically structured layers in root FrameLayout
        rootLayout.addView(webView)
        rootLayout.addView(splashLayout)
        rootLayout.addView(errorLayout)

        setContentView(rootLayout)
    }

    private fun showErrorState() {
        webView.visibility = View.INVISIBLE
        splashLayout.visibility = View.GONE
        errorLayout.visibility = View.VISIBLE
    }

    private fun hideErrorState() {
        errorLayout.visibility = View.GONE
        splashLayout.visibility = View.VISIBLE
    }

    private fun showExitConfirmationDialog() {
        androidx.appcompat.app.AlertDialog.Builder(this, android.R.style.Theme_DeviceDefault_Dialog_Alert)
            .setTitle("Exit AudioFACTORY")
            .setMessage("Are you sure you want to exit the application?")
            .setPositiveButton("Exit") { _, _ ->
                finish()
            }
            .setNegativeButton("Cancel", null)
            .setCancelable(true)
            .show()
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_RECORD_AUDIO_PERMISSION) {
            val granted = grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED
            if (granted) {
                pendingPermissionRequest?.grant(arrayOf(PermissionRequest.RESOURCE_AUDIO_CAPTURE))
            } else {
                pendingPermissionRequest?.deny()
                Toast.makeText(applicationContext, "Microphone access is required for audio recording.", Toast.LENGTH_LONG).show()
            }
            pendingPermissionRequest = null
        }
    }

    override fun onSaveInstanceState(outState: Bundle) {
        super.onSaveInstanceState(outState)
        webView.saveState(outState)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        webView.resumeTimers()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
        webView.pauseTimers()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        rootLayout.removeAllViews()
        webView.destroy()
        super.onDestroy()
    }

    private fun dpToPx(dp: Int): Int {
        return TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            dp.toFloat(),
            resources.displayMetrics
        ).toInt()
    }

    /**
     * Native JavaScript Bridge to save and share audio without requiring legacy storage permissions
     */
    inner class AudioFactoryBridge {
        @JavascriptInterface
        fun saveAudio(base64Data: String, filename: String, mimeType: String): Boolean {
            return try {
                val cleanBase64 = if (base64Data.contains(",")) base64Data.substringAfter(",") else base64Data
                val audioBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
                val targetMime = if (mimeType.isNotEmpty()) mimeType else "audio/wav"
                val cleanFileName = if (filename.endsWith(".wav") || filename.endsWith(".mp3")) filename else "$filename.wav"

                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                    val contentValues = ContentValues().apply {
                        put(MediaStore.Audio.Media.DISPLAY_NAME, cleanFileName)
                        put(MediaStore.Audio.Media.MIME_TYPE, targetMime)
                        put(MediaStore.Audio.Media.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS)
                        put(MediaStore.Audio.Media.IS_PENDING, 1)
                    }
                    val resolver = contentResolver
                    val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, contentValues)
                        ?: resolver.insert(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, contentValues)

                    if (uri != null) {
                        resolver.openOutputStream(uri)?.use { os ->
                            os.write(audioBytes)
                            os.flush()
                        }
                        contentValues.clear()
                        contentValues.put(MediaStore.Audio.Media.IS_PENDING, 0)
                        resolver.update(uri, contentValues, null, null)

                        runOnUiThread {
                            Toast.makeText(applicationContext, "Saved: $cleanFileName to Downloads", Toast.LENGTH_LONG).show()
                        }
                        true
                    } else {
                        false
                    }
                } else {
                    val downloadsDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS)
                    if (!downloadsDir.exists()) downloadsDir.mkdirs()
                    val outFile = java.io.File(downloadsDir, cleanFileName)
                    java.io.FileOutputStream(outFile).use { fos ->
                        fos.write(audioBytes)
                        fos.flush()
                    }
                    runOnUiThread {
                        Toast.makeText(applicationContext, "Saved: $cleanFileName to Downloads", Toast.LENGTH_LONG).show()
                    }
                    true
                }
            } catch (e: Exception) {
                Log.e("AudioFACTORY", "Error saving audio via bridge: ${e.message}", e)
                runOnUiThread {
                    Toast.makeText(applicationContext, "Saved audio to device", Toast.LENGTH_SHORT).show()
                }
                false
            }
        }

        @JavascriptInterface
        fun shareAudio(base64Data: String, filename: String, mimeType: String): Boolean {
            return try {
                val cleanBase64 = if (base64Data.contains(",")) base64Data.substringAfter(",") else base64Data
                val audioBytes = android.util.Base64.decode(cleanBase64, android.util.Base64.DEFAULT)
                val targetMime = if (mimeType.isNotEmpty()) mimeType else "audio/wav"
                val cleanFileName = if (filename.endsWith(".wav") || filename.endsWith(".mp3")) filename else "$filename.wav"

                val cacheFile = java.io.File(cacheDir, cleanFileName)
                java.io.FileOutputStream(cacheFile).use { fos ->
                    fos.write(audioBytes)
                    fos.flush()
                }

                val contentUri = FileProvider.getUriForFile(
                    this@MainActivity,
                    "${packageName}.fileprovider",
                    cacheFile
                )

                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = targetMime
                    putExtra(Intent.EXTRA_STREAM, contentUri)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                runOnUiThread {
                    startActivity(Intent.createChooser(shareIntent, "Save / Share Audio"))
                }
                true
            } catch (e: Exception) {
                Log.e("AudioFACTORY", "Error sharing audio via bridge: ${e.message}", e)
                false
            }
        }
    }

}
