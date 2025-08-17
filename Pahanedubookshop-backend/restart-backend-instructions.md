# 🔄 Backend Restart Instructions

## **Why Password Change is Not Working:**

The password change functionality was added to the backend code, but the backend server needs to be **restarted** to load the new changes.

## **Steps to Fix:**

### **1. Stop the Current Backend Server:**
- Press `Ctrl + C` in the terminal where your backend is running
- Or close the terminal window completely

### **2. Recompile the Backend:**
```bash
cd Pahanedubookshop-backend
javac -cp "lib/*" src/main/java/com/pahana/backend/*.java src/main/java/com/pahana/backend/*/*.java src/main/java/com/pahana/backend/*/*/*.java
```

### **3. Start the Backend Again:**
```bash
java -cp "lib/*:src/main/java" com.pahana.backend.Main
```

### **4. Test the Password Change:**
- Open `test-password-change-simple.html` in your browser
- Click "Test Password Change Endpoint" to verify it's working
- Try changing a password with valid credentials

## **What Was Added:**

✅ **New Endpoint**: `/user/verify-and-change-password`  
✅ **Password Change Logic**: Verifies current password and updates to new password  
✅ **Route Registration**: Added to CustomHttpServer  
✅ **Error Handling**: Proper validation and error responses  

## **Expected Result:**

After restarting, the password change functionality should work:
- Frontend "Change Password" button will be functional
- Users can change passwords through the profile dropdown
- Backend will validate current password and update to new password

## **If Still Not Working:**

1. Check if backend is running on port 12345
2. Verify no compilation errors in terminal
3. Test with the debug page: `test-password-change-simple.html`
4. Check browser console for any error messages

## **Quick Test:**

```bash
# Test if endpoint responds
curl -X POST http://localhost:12345/user/verify-and-change-password \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","currentPassword":"test","newPassword":"test"}'
```

**The password change functionality is implemented and ready - just needs a backend restart!** 🚀
