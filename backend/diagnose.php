<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';

echo "=== Checking Service Providers ===\n";

// Get all registered providers
$providers = $app->getLoadedProviders();

echo "Loaded Service Providers:\n";
foreach ($providers as $provider => $loaded) {
    if ($loaded) {
        echo "✅ $provider\n";
    }
}

// Check specifically for RouteServiceProvider
if (isset($providers[App\Providers\RouteServiceProvider::class]) && $providers[App\Providers\RouteServiceProvider::class]) {
    echo "\n✅ RouteServiceProvider is loaded\n";
} else {
    echo "\n❌ RouteServiceProvider is NOT loaded\n";
    
    // Let's see what's in config
    echo "\nChecking config/app.php providers:\n";
    $configProviders = include __DIR__.'/config/app.php';
    foreach ($configProviders['providers'] as $provider) {
        echo " - $provider\n";
    }
}