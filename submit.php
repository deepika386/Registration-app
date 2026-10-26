<?php
// Server-side validation + JSON response for the registration form.
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'errors' => ['Method not allowed.']]);
    exit;
}

function clean($key) {
    return isset($_POST[$key]) ? trim(strip_tags((string)$_POST[$key])) : '';
}

$fullName = clean('fullName');
$email    = clean('email');
$phone    = clean('phone');
$dob      = clean('dob');
$gender   = clean('gender');
$course   = clean('course');
$address  = clean('address');
$agree    = clean('agree');

$allowedGender  = ['Male', 'Female', 'Other'];
$allowedCourse  = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'];
$allowedInterst = ['Web Development', 'Data Science', 'Cloud Computing', 'Cyber Security'];

$interests = [];
if (isset($_POST['interests']) && is_array($_POST['interests'])) {
    foreach ($_POST['interests'] as $i) {
        $i = trim(strip_tags((string)$i));
        if (in_array($i, $allowedInterst, true)) {
            $interests[] = $i;
        }
    }
}

$errors = [];
if ($fullName === '' || mb_strlen($fullName) > 100)      $errors[] = 'Full name is required (max 100 characters).';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))          $errors[] = 'A valid email is required.';
if (!preg_match('/^[0-9]{10}$/', $phone))                $errors[] = 'Phone must be exactly 10 digits.';
$d = DateTime::createFromFormat('Y-m-d', $dob);
if (!$d || $d->format('Y-m-d') !== $dob)                 $errors[] = 'Date of birth is invalid.';
elseif ($d > new DateTime('today'))                      $errors[] = 'Date of birth cannot be in the future.';
if (!in_array($gender, $allowedGender, true))            $errors[] = 'Select a valid gender.';
if (!in_array($course, $allowedCourse, true))            $errors[] = 'Select a valid course.';
if ($address === '' || mb_strlen($address) > 300)        $errors[] = 'Address is required (max 300 characters).';
if ($agree !== 'yes')                                    $errors[] = 'You must confirm the declaration.';

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'errors' => $errors]);
    exit;
}

date_default_timezone_set('Asia/Kolkata');
$reference = 'REG-' . date('Ymd') . '-' . strtoupper(substr(bin2hex(random_bytes(3)), 0, 6));

echo json_encode([
    'success' => true,
    'data' => [
        'reference'   => $reference,
        'submittedAt' => date('d M Y, h:i A'),
        'fullName'    => $fullName,
        'email'       => $email,
        'phone'       => $phone,
        'dob'         => $d->format('d M Y'),
        'gender'      => $gender,
        'course'      => $course,
        'interests'   => $interests,
        'address'     => $address,
    ],
]);