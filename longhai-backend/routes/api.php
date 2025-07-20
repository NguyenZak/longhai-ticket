<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\EventController;
use App\Http\Controllers\API\TicketController;
use App\Http\Controllers\API\BookingController;
use App\Http\Controllers\API\UserController;
use App\Http\Controllers\API\SeatingController;
use App\Http\Controllers\API\ScrumboardController;
use App\Http\Controllers\API\UploadController;
use App\Http\Controllers\API\BannerController;
use App\Http\Controllers\API\ProfileController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\ChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Public event routes for frontend
Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{id}', [EventController::class, 'show']);

// Public banner routes for frontend
Route::get('/banners', [BannerController::class, 'index']);
Route::get('/banners/all', [BannerController::class, 'all']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Events (Admin only)
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);

    // Tickets
    Route::get('/tickets', [TicketController::class, 'index']);
    Route::get('/tickets/{id}', [TicketController::class, 'show']);
    Route::post('/tickets', [TicketController::class, 'store']);
    Route::put('/tickets/{id}', [TicketController::class, 'update']);
    Route::delete('/tickets/{id}', [TicketController::class, 'destroy']);
    Route::get('/tickets/types', [TicketController::class, 'getTicketTypes']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{id}', [BookingController::class, 'show']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::put('/bookings/{id}', [BookingController::class, 'update']);
    Route::delete('/bookings/{id}', [BookingController::class, 'destroy']);

    // Users (Admin only)
    Route::middleware('permission:manage_users')->group(function () {
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/roles-permissions', [UserController::class, 'getRolesAndPermissions']);
        Route::get('/users/{id}', [UserController::class, 'show']);
        Route::post('/users', [UserController::class, 'store']);
        Route::put('/users/{id}', [UserController::class, 'update']);
        Route::delete('/users/{id}', [UserController::class, 'destroy']);
    });

    // Seating Management
    Route::prefix('seats')->group(function () {
        // Get seats for an event
        Route::get('/{eventId}', [SeatingController::class, 'getSeats']);
        
        // Save/update seats for an event
        Route::post('/{eventId}', [SeatingController::class, 'saveSeats']);
        
        // Update a single seat
        Route::put('/{eventId}/{seatId}', [SeatingController::class, 'updateSeat']);
        
        // Delete a seat
        Route::delete('/{eventId}/{seatId}', [SeatingController::class, 'deleteSeat']);
        
        // Get seat statistics
        Route::get('/{eventId}/stats', [SeatingController::class, 'getSeatStats']);
        
        // Get ticket types for an event
        Route::get('/{eventId}/ticket-types', [SeatingController::class, 'getTicketTypes']);
        
        // Export seats
        Route::get('/{eventId}/export', [SeatingController::class, 'exportSeats']);
    });

    // Scrumboard Management
    Route::prefix('scrumboard')->group(function () {
        // Get all projects with tasks
        Route::get('/', [ScrumboardController::class, 'index']);
        
        // Project routes
        Route::post('/projects', [ScrumboardController::class, 'storeProject']);
        Route::put('/projects/{id}', [ScrumboardController::class, 'updateProject']);
        Route::delete('/projects/{id}', [ScrumboardController::class, 'destroyProject']);
        Route::delete('/projects/{id}/tasks', [ScrumboardController::class, 'clearProjectTasks']);
        
        // Task routes
        Route::post('/tasks', [ScrumboardController::class, 'storeTask']);
        Route::put('/tasks/{id}', [ScrumboardController::class, 'updateTask']);
        Route::delete('/tasks/{id}', [ScrumboardController::class, 'destroyTask']);
        
        // Update task order (drag & drop)
        Route::post('/tasks/order', [ScrumboardController::class, 'updateTaskOrder']);
    });

    // Upload Management
    Route::prefix('upload')->group(function () {
        // Upload event image
        Route::post('/event-image', [UploadController::class, 'uploadEventImage']);
        
        // Upload map image
        Route::post('/map-image', [UploadController::class, 'uploadMapImage']);
        
        // Upload artist image
        Route::post('/artist-image', [UploadController::class, 'uploadArtistImage']);
        
        // Upload event description image
        Route::post('/event-description-image', [UploadController::class, 'uploadEventDescriptionImage']);
        
        // Upload banner image
        Route::post('/banner-image', [UploadController::class, 'uploadBannerImage']);
        
        // Delete image
        Route::delete('/image', [UploadController::class, 'deleteImage']);
    });

    // Admin banner routes
    Route::prefix('banners')->group(function () {
        Route::post('/', [BannerController::class, 'store']);
        Route::put('/{id}', [BannerController::class, 'update']);
        Route::delete('/{id}', [BannerController::class, 'destroy']);
        Route::post('/upload', [BannerController::class, 'uploadImage']);
    });

    // Chat routes
    Route::prefix('chat')->group(function () {
        Route::get('/messages', [ChatController::class, 'getMessages']);
        Route::post('/messages', [ChatController::class, 'sendMessage']);
        Route::get('/online-users', [ChatController::class, 'getOnlineUsers']);
        Route::get('/conversations', [ChatController::class, 'getRecentConversations']);
        Route::post('/mark-read', [ChatController::class, 'markAsRead']);
        Route::post('/update-last-seen', [ChatController::class, 'updateLastSeen']);
    });

    // Profile routes
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'show']);
        Route::put('/', [ProfileController::class, 'update']);
        Route::post('/change-password', [ProfileController::class, 'changePassword']);
        Route::post('/upload-avatar', [ProfileController::class, 'uploadAvatar']);
        Route::delete('/avatar', [ProfileController::class, 'deleteAvatar']);
        Route::get('/stats', [ProfileController::class, 'getStats']);
        Route::get('/activity', [ProfileController::class, 'getActivity']);
    });

    // Dashboard routes
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'getStats']);
        Route::get('/activities', [DashboardController::class, 'getRecentActivities']);
        Route::get('/revenue-chart', [DashboardController::class, 'getRevenueChart']);
        Route::get('/booking-chart', [DashboardController::class, 'getBookingChart']);
        Route::get('/top-events', [DashboardController::class, 'getTopEvents']);
        Route::get('/upcoming-events', [DashboardController::class, 'getUpcomingEvents']);
        Route::get('/user-growth', [DashboardController::class, 'getUserGrowthChart']);
        Route::get('/event-stats', [DashboardController::class, 'getEventStats']);
    });

    // Notification routes
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread-count', [NotificationController::class, 'getUnreadCount']);
        Route::post('/mark-read', [NotificationController::class, 'markAsRead']);
        Route::delete('/{id}', [NotificationController::class, 'destroy']);
        Route::delete('/', [NotificationController::class, 'clearAll']);
        Route::get('/settings', [NotificationController::class, 'getSettings']);
        Route::put('/settings', [NotificationController::class, 'updateSettings']);
    });

    // Report routes
    Route::prefix('reports')->group(function () {
        Route::get('/bookings', [ReportController::class, 'getBookingReport']);
        Route::get('/events', [ReportController::class, 'getEventReport']);
        Route::get('/users', [ReportController::class, 'getUserReport']);
        Route::get('/revenue', [ReportController::class, 'getRevenueReport']);
        Route::get('/tickets', [ReportController::class, 'getTicketReport']);
        Route::get('/export', [ReportController::class, 'exportReport']);
    });
}); 