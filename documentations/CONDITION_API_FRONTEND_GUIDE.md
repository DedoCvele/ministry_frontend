# Condition API - Frontend Implementation Guide

## Overview

The condition system has been updated to use **integer IDs** instead of string names. The backend now returns conditions with IDs, and accepts both integer IDs and string names (for backward compatibility).

---

## API Endpoint: GET `/api/conditions`

### Response Format

**Before (old format - no longer used):**
```json
{
    "status": "success",
    "count": 5,
    "data": [
        "New with tags",
        "Excellent",
        "Very good",
        "Good",
        "Fair"
    ]
}
```

**Now (new format):**
```json
{
    "status": "success",
    "count": 5,
    "data": [
        {"id": 1, "name": "New with tags"},
        {"id": 2, "name": "Excellent"},
        {"id": 3, "name": "Very good"},
        {"id": 4, "name": "Good"},
        {"id": 5, "name": "Fair"}
    ]
}
```

---

## Condition ID Mapping

| ID | Name |
|----|------|
| 1 | New with tags |
| 2 | Excellent |
| 3 | Very good |
| 4 | Good |
| 5 | Fair |

---

## Frontend Implementation

### 1. Fetching Conditions

```javascript
// Fetch conditions from API
const response = await fetch('http://localhost:8000/api/conditions');
const result = await response.json();

// result.data is now an array of objects:
// [
//   {id: 1, name: "New with tags"},
//   {id: 2, name: "Excellent"},
//   ...
// ]
```

### 2. Populating Dropdown

```javascript
// Example: React component
const [conditions, setConditions] = useState([]);
const [selectedConditionId, setSelectedConditionId] = useState(null);

// Fetch conditions on component mount
useEffect(() => {
  fetch('http://localhost:8000/api/conditions')
    .then(res => res.json())
    .then(data => {
      setConditions(data.data); // Array of {id, name} objects
    });
}, []);

// Render dropdown
<select 
  value={selectedConditionId || ''} 
  onChange={(e) => setSelectedConditionId(parseInt(e.target.value))}
>
  <option value="">Select condition</option>
  {conditions.map(condition => (
    <option key={condition.id} value={condition.id}>
      {condition.name}
    </option>
  ))}
</select>
```

### 3. Submitting Item with Condition

**✅ CORRECT - Send integer ID:**
```javascript
const formData = new FormData();
formData.append('title', 'My Item');
formData.append('price', 100);
formData.append('category_id', 3);
formData.append('condition', selectedConditionId); // Send integer ID (1-5)

// Example: condition = 1 (for "New with tags")
```

**❌ WRONG - Don't send string name:**
```javascript
// DON'T DO THIS:
formData.append('condition', 'New with tags'); // This still works but not recommended
```

---

## What Changed in Your Code

### Before (Old Code - Needs Update)

```javascript
// ❌ OLD: Using name as ID
const conditions = [
  {id: 'New with tags', name: 'New with tags'},  // Wrong!
  {id: 'Excellent', name: 'Excellent'},          // Wrong!
  ...
];

// ❌ OLD: Sending name as condition
formData.append('condition', selectedCondition.name); // Wrong!
```

### After (New Code - Correct)

```javascript
// ✅ NEW: Fetch from API - IDs are integers
const response = await fetch('/api/conditions');
const { data } = await response.json();
// data = [{id: 1, name: "New with tags"}, {id: 2, name: "Excellent"}, ...]

// ✅ NEW: Use integer ID
formData.append('condition', selectedCondition.id); // Correct! (integer 1-5)
```

---

## Fixing Your UploadItem.tsx

### Step 1: Update Condition Fetching

Find where you fetch conditions and update it:

```javascript
// OLD CODE (if you have this):
const conditionsResponse = await fetch('/api/conditions');
const conditionsData = await conditionsResponse.json();
const conditions = conditionsData.data.map(name => ({
  id: name,        // ❌ Wrong - using name as ID
  name: name
}));

// NEW CODE:
const conditionsResponse = await fetch('/api/conditions');
const conditionsData = await conditionsResponse.json();
const conditions = conditionsData.data; // ✅ Already has {id, name} format
```

### Step 2: Update Condition Selection Logic

Find where you extract condition ID and update it:

```javascript
// OLD CODE (if you have this):
const conditionId = conditions.find(c => c.name === selectedCondition)?.id;
// This would return a string like "New with tags"

// NEW CODE:
const conditionId = conditions.find(c => c.id === selectedConditionId)?.id;
// This returns an integer like 1, 2, 3, 4, or 5
```

### Step 3: Update Form Submission

Make sure you're sending the integer ID:

```javascript
// When submitting form
if (selectedConditionId) {
  formData.append('condition', selectedConditionId); // Integer ID (1-5)
  console.log('📤 Sending condition as ID:', selectedConditionId);
}
```

---

## Backward Compatibility

**Good News:** The backend still accepts string names for backward compatibility!

- ✅ You can send `condition: 1` (integer ID) - **Recommended**
- ✅ You can send `condition: "New with tags"` (string name) - Still works

However, **using integer IDs is recommended** because:
1. It's more efficient
2. It matches the database structure
3. It's consistent with how categories and brands work (they use IDs)

---

## Example: Complete Flow

```javascript
// 1. Fetch conditions on component load
useEffect(() => {
  const fetchConditions = async () => {
    const res = await fetch('http://localhost:8000/api/conditions');
    const { data } = await res.json();
    setConditions(data); // [{id: 1, name: "New with tags"}, ...]
  };
  fetchConditions();
}, []);

// 2. User selects condition from dropdown
const handleConditionChange = (e) => {
  const conditionId = parseInt(e.target.value); // e.g., 1, 2, 3, 4, or 5
  setSelectedConditionId(conditionId);
};

// 3. Submit form with condition ID
const handleSubmit = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  
  formData.append('title', itemTitle);
  formData.append('price', price);
  formData.append('category_id', categoryId);
  
  // Send integer ID (1-5)
  if (selectedConditionId) {
    formData.append('condition', selectedConditionId);
  }
  
  // Submit...
  await fetch('/api/items', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
};
```

---

## Quick Checklist

- [ ] Update `/api/conditions` fetch to use new format (objects with `id` and `name`)
- [ ] Update dropdown to use `condition.id` as the value (integer)
- [ ] Update dropdown to display `condition.name` as the label (string)
- [ ] Update form submission to send `condition` as integer ID (1-5)
- [ ] Remove any code that uses condition name as ID
- [ ] Test that condition is sent correctly in form submission

---

## Debugging

If you're still getting errors, check:

1. **What format is the API returning?**
   ```javascript
   const res = await fetch('/api/conditions');
   const data = await res.json();
   console.log('Conditions:', data.data);
   // Should show: [{id: 1, name: "New with tags"}, ...]
   ```

2. **What are you sending in the form?**
   ```javascript
   console.log('Condition ID being sent:', selectedConditionId);
   // Should be: 1, 2, 3, 4, or 5 (integer)
   // NOT: "New with tags" (string)
   ```

3. **Check the network request:**
   - Open browser DevTools → Network tab
   - Submit the form
   - Check the request payload
   - `condition` should be an integer (1-5), not a string

---

## Summary

**The fix is simple:**
1. The API now returns `{id: 1, name: "New with tags"}` instead of just `"New with tags"`
2. Use the `id` field (integer) when submitting the form
3. Use the `name` field (string) when displaying in the dropdown

That's it! The backend handles the rest automatically.
