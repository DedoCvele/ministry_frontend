# Authentication System Documentation

## Overview
This Laravel application uses session-based authentication with role-based access control. The system handles user registration, login, logout, and includes security features like rate limiting and password hashing.

---

## 1. USER REGISTRATION

### Routes
- **GET** `/register` - Display registration form
- **POST** `/register` - Process registration

**Location:** `routes/auth.php` (lines 15-18)

```php
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
});
```

### Controller
**File:** `app/Http/Controllers/Auth/RegisteredUserController.php`

#### `create()` Method
- Returns the registration view: `resources/views/auth/register.blade.php`
- Only accessible to guests (not authenticated users)

#### `store()` Method - Registration Logic
1. **Validation:**
   - `name`: required, string, max 255 characters
   - `email`: required, string, lowercase, email format, max 255, must be unique in users table
   - `password`: required, confirmed, must meet Laravel's default password rules

2. **User Creation:**
   ```php
   $user = User::create([
       'name' => $request->name,
       'email' => $request->email,
       'password' => Hash::make($request->password),
   ]);
   ```
   - Password is hashed using `Hash::make()`
   - User is created with default role: `'buyer'` (from migration)

3. **Post-Registration:**
   - Fires `Registered` event (can trigger email verification, etc.)
   - Automatically logs in the user: `Auth::login($user)`
   - Redirects to dashboard: `route('dashboard')`

### Registration Form
**File:** `resources/views/auth/register.blade.php`

**Fields:**
- Name (text input)
- Email (email input)
- Password (password input)
- Password Confirmation (password input)
- CSRF token protection

**Features:**
- Form validation error display
- Old input preservation on validation errors
- Link to login page if already registered

---

## 2. LOGIN / SIGN-IN

### Routes
- **GET** `/login` - Display login form
- **POST** `/login` - Process login

**Location:** `routes/auth.php` (lines 20-23)

```php
Route::middleware('guest')->group(function () {
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});
```

### Controller
**File:** `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

#### `create()` Method
- Returns the login view: `resources/views/auth/login.blade.php`
- Only accessible to guests

#### `store()` Method - Login Logic
**Uses:** `LoginRequest` form request for validation and authentication

1. **Authentication Process:**
   ```php
   $request->authenticate();  // Handled by LoginRequest
   $request->session()->regenerate();  // Security: regenerate session ID
   ```

2. **Role-Based Redirect:**
   ```php
   if ($request->user()->role === 'admin') {
       return redirect()->route('admin.dashboard'); 
   }
   return redirect()->intended(route('dashboard'));
   ```
   - Admins → Admin Dashboard
   - Regular users → User Dashboard (or intended URL if redirected from protected route)

### LoginRequest Form Request
**File:** `app/Http/Requests/Auth/LoginRequest.php`

#### Validation Rules
- `email`: required, string, email format
- `password`: required, string

#### `authenticate()` Method
1. **Rate Limiting Check:**
   - Ensures user is not rate-limited (max 5 attempts)
   - Uses throttle key based on: `email|ip_address`

2. **Authentication Attempt:**
   ```php
   Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))
   ```
   - Checks email/password against database
   - Supports "Remember Me" functionality (stores remember token)

3. **On Failure:**
   - Increments rate limiter
   - Throws validation exception with "auth.failed" message

4. **On Success:**
   - Clears rate limiter
   - Authentication proceeds

#### Rate Limiting Details
- **Max Attempts:** 5 failed login attempts
- **Throttle Key:** `email|ip_address` (lowercase, transliterated)
- **Lockout:** After 5 attempts, user is locked out
- **Lockout Event:** Fires `Lockout` event
- **Error Message:** Shows remaining seconds/minutes until unlock

### Login Form
**File:** `resources/views/auth/login.blade.php`

**Fields:**
- Email (email input)
- Password (password input)
- Remember Me (checkbox)
- CSRF token protection

**Features:**
- Form validation error display
- Old input preservation
- "Forgot Password" link
- Remember me functionality

---

## 3. LOGOUT

### Route
- **POST** `/logout` - Destroy authenticated session

**Location:** `routes/auth.php` (line 57)

```php
Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');
});
```

### Controller Method
**File:** `app/Http/Controllers/Auth/AuthenticatedSessionController.php`

#### `destroy()` Method
```php
public function destroy(Request $request): RedirectResponse
{
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
}
```

**Process:**
1. Logs out user from 'web' guard
2. Invalidates the session
3. Regenerates CSRF token (prevents CSRF attacks)
4. Redirects to home page (`/`)

---

## 4. AUTHENTICATION MIDDLEWARE

### Authenticate Middleware
**File:** `app/Http/Middleware/Authenticate.php`

**Purpose:** Protects routes that require authentication

**Behavior:**
- If user is not authenticated and request expects JSON → returns `null` (401 response)
- If user is not authenticated and request expects HTML → redirects to `route('login')`

**Registration:** `bootstrap/app.php` (line 18)
```php
$middleware->alias([
    'auth' => Authenticate::class,
]);
```

### Guest Middleware
**Purpose:** Ensures routes are only accessible to non-authenticated users

**Usage:** Applied to registration and login routes to prevent authenticated users from accessing them

### Admin Middleware
**File:** `app/Http/Middleware/AdminMiddleware.php`

**Purpose:** Restricts access to admin-only routes

**Logic:**
```php
if (auth()->check() && auth()->user()->role === 'admin') {
    return $next($request);
}
abort(403);  // Forbidden if not admin
```

**Registration:** `bootstrap/app.php` (line 20)
```php
'alias' => [
    'admin' => \App\Http\Middleware\AdminMiddleware::class,
]
```

**Usage Example:** `routes/web.php` (line 43)
```php
Route::middleware(['auth', AdminMiddleware::class])->name('admin.')->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('dashboard');
});
```

---

## 5. USER MODEL

**File:** `app/Models/User.php`

### Model Details
- Extends: `Illuminate\Foundation\Auth\User as Authenticatable`
- Uses: `HasFactory`, `Notifiable` traits

### Mass Assignable Fields
```php
protected $fillable = [
    'name',
    'email',
    'password',
    'role'
];
```

### Hidden Fields (for serialization)
```php
protected $hidden = [
    'password',
    'remember_token',
];
```

### Casts
```php
protected function casts(): array
{
    return [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',  // Auto-hashes password on assignment
    ];
}
```

### Relationships
```php
public function items()
{
    return $this->hasMany(\App\Models\Item::class);
}
```

---

## 6. DATABASE STRUCTURE

**Migration:** `database/migrations/0001_01_01_000000_create_users_table.php`

### Users Table Schema
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('phone')->nullable();
    $table->string('city')->nullable();
    $table->enum('role', ['buyer', 'seller', 'admin'])->default('buyer');
    $table->rememberToken();  // For "Remember Me" functionality
    $table->timestamps();
});
```

### Supporting Tables

#### Password Reset Tokens
```php
Schema::create('password_reset_tokens', function (Blueprint $table) {
    $table->string('email')->primary();
    $table->string('token');
    $table->timestamp('created_at')->nullable();
});
```

#### Sessions
```php
Schema::create('sessions', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->foreignId('user_id')->nullable()->index();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->longText('payload');
    $table->integer('last_activity')->index();
});
```

---

## 7. AUTHENTICATION CONFIGURATION

**File:** `config/auth.php`

### Default Guard
```php
'defaults' => [
    'guard' => env('AUTH_GUARD', 'web'),
    'passwords' => env('AUTH_PASSWORD_BROKER', 'users'),
],
```

### Guards
```php
'guards' => [
    'web' => [
        'driver' => 'session',  // Session-based authentication
        'provider' => 'users',
    ],
],
```

### User Provider
```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => env('AUTH_MODEL', App\Models\User::class),
    ],
],
```

### Password Reset Configuration
```php
'passwords' => [
    'users' => [
        'provider' => 'users',
        'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
        'expire' => 60,      // Token expires in 60 minutes
        'throttle' => 60,    // Throttle reset requests (60 seconds)
    ],
],
```

### Password Confirmation Timeout
```php
'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),  // 3 hours
```

---

## 8. SECURITY FEATURES

### 1. Password Hashing
- Passwords are hashed using `Hash::make()` (bcrypt by default)
- Model auto-hashes passwords via `'password' => 'hashed'` cast

### 2. CSRF Protection
- All forms include `@csrf` token
- Session token regeneration on logout

### 3. Rate Limiting
- **Login:** Max 5 attempts per email+IP combination
- **Password Reset:** Throttled (60 seconds between requests)

### 4. Session Security
- Session ID regeneration on login (prevents session fixation)
- Session invalidation on logout
- CSRF token regeneration on logout

### 5. Input Validation
- Email format validation
- Password confirmation required
- Unique email constraint
- Password strength rules (Laravel defaults)

### 6. Role-Based Access Control
- Three roles: `buyer`, `seller`, `admin`
- Admin routes protected by `AdminMiddleware`
- Role-based redirects after login

---

## 9. ROUTE PROTECTION EXAMPLES

### Protected Routes (Require Authentication)
```php
// routes/web.php
Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [ItemController::class, 'userItems'])->name('dashboard');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
});
```

### Admin-Only Routes
```php
Route::middleware(['auth', AdminMiddleware::class])->name('admin.')->group(function () {
    Route::get('/admin/dashboard', [AdminController::class, 'index'])->name('dashboard');
    Route::patch('/items/{id}/approve', [AdminController::class, 'approveItem'])->name('items.approve');
});
```

### Guest-Only Routes
```php
// routes/auth.php
Route::middleware('guest')->group(function () {
    Route::get('register', [RegisteredUserController::class, 'create'])->name('register');
    Route::post('register', [RegisteredUserController::class, 'store']);
    Route::get('login', [AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});
```

---

## 10. ADDITIONAL AUTHENTICATION FEATURES

### Password Reset
- **GET** `/forgot-password` - Request password reset
- **POST** `/forgot-password` - Send reset email
- **GET** `/reset-password/{token}` - Show reset form
- **POST** `/reset-password` - Process reset

### Email Verification
- **GET** `/verify-email` - Email verification notice
- **GET** `/verify-email/{id}/{hash}` - Verify email
- **POST** `/email/verification-notification` - Resend verification email

### Password Confirmation
- **GET** `/confirm-password` - Show password confirmation form
- **POST** `/confirm-password` - Confirm password

### Password Update
- **PUT** `/password` - Update user password

---

## 11. TESTING

### Authentication Tests
**File:** `tests/Feature/Auth/AuthenticationTest.php`

**Tests:**
- Login screen can be rendered
- Users can authenticate with valid credentials
- Users cannot authenticate with invalid password
- Users can logout

### Registration Tests
**File:** `tests/Feature/Auth/RegistrationTest.php`

**Tests:**
- Registration screen can be rendered
- New users can register

---

## 12. FLOW DIAGRAMS

### Registration Flow
```
User → GET /register → RegisteredUserController@create → View
User → POST /register → RegisteredUserController@store → Validate → Create User → Login → Redirect to Dashboard
```

### Login Flow
```
User → GET /login → AuthenticatedSessionController@create → View
User → POST /login → LoginRequest → Validate → Rate Limit Check → Auth::attempt() → Session Regenerate → Role Check → Redirect
```

### Logout Flow
```
User → POST /logout → AuthenticatedSessionController@destroy → Auth::logout() → Invalidate Session → Regenerate Token → Redirect to Home
```

### Protected Route Access Flow
```
Request → Auth Middleware → Check Authentication → If Not Authenticated → Redirect to Login → If Authenticated → Continue
```

---

## 13. KEY FILES REFERENCE

| File | Purpose |
|------|---------|
| `routes/auth.php` | Authentication routes |
| `app/Http/Controllers/Auth/RegisteredUserController.php` | Registration logic |
| `app/Http/Controllers/Auth/AuthenticatedSessionController.php` | Login/logout logic |
| `app/Http/Requests/Auth/LoginRequest.php` | Login validation & authentication |
| `app/Http/Middleware/Authenticate.php` | Authentication middleware |
| `app/Http/Middleware/AdminMiddleware.php` | Admin access control |
| `app/Models/User.php` | User model |
| `config/auth.php` | Authentication configuration |
| `resources/views/auth/register.blade.php` | Registration form |
| `resources/views/auth/login.blade.php` | Login form |
| `database/migrations/0001_01_01_000000_create_users_table.php` | User table schema |
| `bootstrap/app.php` | Middleware registration |

---

## 14. SUMMARY

This Laravel application implements a complete authentication system with:

✅ **Registration** - User signup with validation and auto-login  
✅ **Login** - Email/password authentication with rate limiting  
✅ **Logout** - Secure session destruction  
✅ **Role-Based Access** - Buyer, Seller, Admin roles  
✅ **Security** - Password hashing, CSRF protection, rate limiting, session security  
✅ **Password Reset** - Full password reset functionality  
✅ **Email Verification** - Email verification support  
✅ **Remember Me** - Persistent login sessions  
✅ **Middleware Protection** - Route protection via middleware  

The system uses Laravel's built-in authentication scaffolding with customizations for role-based redirects and admin access control.

