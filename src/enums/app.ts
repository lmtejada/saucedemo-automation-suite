/** Storage state file paths */
export enum StorageStatePaths {
    APP = '.auth/app/appStorageState.json',
    ADMIN_APP = '.auth/app/adminAppStorageState.json',
}

/** Messages used in the application */
export enum Messages {
    LOGIN_ERROR = 'Epic sadface: Username and password do not match any user in this service',
    LOGIN_ERROR_EMPTY_USERNAME = 'Epic sadface: Username is required',
    LOGIN_ERROR_EMPTY_PASSWORD = 'Epic sadface: Password is required',
}
