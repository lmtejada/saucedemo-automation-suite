/** Storage state file paths */
export enum StorageStatePaths {
    APP = '.auth/app/appStorageState.json',
    ADMIN_APP = '.auth/app/adminAppStorageState.json',
    CART = '.auth/app/cartState.json',
    PERFORMANCE_USER = '.auth/app/performanceUserState.json',
    PROBLEM_USER = '.auth/app/problemUserState.json',
}

/** Messages used in the application */
export enum Messages {
    LOGIN_ERROR = 'Epic sadface: Username and password do not match any user in this service',
    LOGIN_ERROR_EMPTY_USERNAME = 'Epic sadface: Username is required',
    LOGIN_ERROR_EMPTY_PASSWORD = 'Epic sadface: Password is required',
    LOGIN_ERROR_LOCKED_OUT = 'Epic sadface: Sorry, this user has been locked out.',
    LOGIN_REQUIRED = `Epic sadface: You can only access '/inventory.html' when you are logged in.`,
}
