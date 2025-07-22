<?php



use App\Http\Controllers\API\ContactController;

// Public routes
Route::post('/contacts', [ContactController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    // Contact management (CMS)
    Route::get('/contacts', [ContactController::class, 'index']);
    Route::get('/contacts/{id}', [ContactController::class, 'show']);
    Route::delete('/contacts/{id}', [ContactController::class, 'destroy']);
}); 