<?php
// Manual Bootstrap File
require_once __DIR__.'/vendor/autoload.php';

$app = require_once __DIR__.'/bootstrap/app.php';

// Manually load routes BEFORE booting kernel
Illuminate\Support\Facades\Route::prefix('api')->group(function() {
    require __DIR__.'/routes/api.php';
});

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

return $app;
