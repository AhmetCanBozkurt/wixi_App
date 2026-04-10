import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import { ChevronRight, UserPlus, Check, GraduationCap } from 'lucide-react';
import AuthService from '../ApiServices/services/AuthService';
import { clientService } from '../ApiServices/services';
import type { IEducationTypeDto } from '../ApiServices/types/ClientTypes';
import { useLanguage } from '../contexts/language-context';

interface RegistrationData {
  // Step 1
  accessCode: string;
  // Step 2
  username: string;
  password: string;
  confirmPassword: string;
  // Step 3
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: string;
  email: string;
  phone: string;
  educationTypeId: number | null;
  // Step 4
  middleSchool: string;
  highSchool: string;
  universities: Array<{
    name: string;
    degree: string;
    field: string;
    graduationYear: string;
  }>;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [educationTypes, setEducationTypes] = useState<IEducationTypeDto[]>([]);
  const [loadingEducationTypes, setLoadingEducationTypes] = useState(false);
  const [loadingPendingCode, setLoadingPendingCode] = useState(false);
  
  // Helper function to get education type name based on current language
  const getEducationTypeName = (type: IEducationTypeDto): string => {
    const lang = language.toUpperCase();
    switch (lang) {
      case 'TR':
        return type.name_TR || type.name || '';
      case 'EN':
        return type.name_EN || type.nameEn || type.name_TR || type.name || '';
      case 'DE':
        return type.name_DE || type.name_EN || type.nameEn || type.name_TR || type.name || '';
      case 'AR':
        return type.name_AR || type.name_TR || type.name || '';
      default:
        return type.name_TR || type.name || '';
    }
  };
  const [formData, setFormData] = useState<RegistrationData>({
    accessCode: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    address: '',
    email: '',
    phone: '',
    educationTypeId: null,
    middleSchool: '',
    highSchool: '',
    universities: [{ name: '', degree: '', field: '', graduationYear: '' }],
  });

  // Function to load pending client code information and auto-fill form
  const loadPendingCodeInfo = useCallback(async (clientCode: string) => {
    if (!clientCode || clientCode.trim() === '') {
      return;
    }

    try {
      setLoadingPendingCode(true);
      const pendingCodeInfo = await clientService.getPendingClientCodeByCode(clientCode);

      if (pendingCodeInfo && pendingCodeInfo.isValid) {
        // Auto-fill form with pending code information
        setFormData(prev => ({
          ...prev,
          // Only fill if fields are empty (don't overwrite user input)
          email: prev.email || pendingCodeInfo.email || '',
          firstName: prev.firstName || pendingCodeInfo.firstName || '',
          lastName: prev.lastName || pendingCodeInfo.lastName || '',
          // username can be email if not set
          username: prev.username || pendingCodeInfo.email || ''
        }));

        toast({
          title: '✅ Bilgiler Yüklendi',
          description: 'Müşteri kodunuzdan bilgiler otomatik olarak dolduruldu. Lütfen eksik bilgileri tamamlayın.',
        });
      } else if (pendingCodeInfo && !pendingCodeInfo.isValid) {
        // Code exists but is invalid (used or expired)
        if (pendingCodeInfo.isUsed) {
          toast({
            variant: 'destructive',
            title: '⚠️ Kod Kullanılmış',
            description: 'Bu müşteri kodu daha önce kullanılmış. Lütfen yeni bir kod alın.',
          });
        } else if (pendingCodeInfo.isExpired) {
          toast({
            variant: 'destructive',
            title: '⚠️ Kod Süresi Dolmuş',
            description: 'Bu müşteri kodunun süresi dolmuş. Lütfen yeni bir kod alın.',
          });
        }
      }
      // If code not found, silently continue (user can still register)
    } catch (error) {
      console.warn('Could not load pending client code info:', error);
      // Don't show error - user can still register without it
    } finally {
      setLoadingPendingCode(false);
    }
  }, [toast]);

  // Read client code from URL parameter on mount and load pending code info
  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setFormData(prev => ({ ...prev, accessCode: code }));
      // Load pending code info when code is in URL
      loadPendingCodeInfo(code);
    }
  }, [searchParams, loadPendingCodeInfo]);

  // Load pending client code information when accessCode changes
  useEffect(() => {
    if (formData.accessCode && formData.accessCode.trim() !== '') {
      // Debounce the API call
      const timeoutId = setTimeout(() => {
        loadPendingCodeInfo(formData.accessCode);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [formData.accessCode, loadPendingCodeInfo]);

  // Load education types on mount
  useEffect(() => {
    const loadEducationTypes = async () => {
      try {
        setLoadingEducationTypes(true);
        // Note: This endpoint might require auth, but we'll try anyway
        // If it fails, we'll handle it gracefully
        const types = await clientService.getEducationTypes();
        setEducationTypes(types || []);
      } catch (error) {
        console.warn('⚠️ Could not load education types (may require auth):', error);
        // Don't show error to user - education type is optional
        setEducationTypes([]);
      } finally {
        setLoadingEducationTypes(false);
      }
    };
    loadEducationTypes();
  }, []);

  const steps = [
    { id: 1, name: 'Step 1: Access', short: 'Access' },
    { id: 2, name: 'Step 2: Account', short: 'Account' },
    { id: 3, name: 'Step 3: Personal', short: 'Personal' },
    { id: 4, name: 'Step 4: Education', short: 'Education' },
  ];

  const handleInputChange = (field: keyof RegistrationData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleUniversityChange = (index: number, field: string, value: string) => {
    const updatedUniversities = [...formData.universities];
    updatedUniversities[index] = { ...updatedUniversities[index], [field]: value };
    setFormData({ ...formData, universities: updatedUniversities });
  };

  const addUniversity = () => {
    setFormData({
      ...formData,
      universities: [...formData.universities, { name: '', degree: '', field: '', graduationYear: '' }],
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.accessCode) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please enter your access code' });
          return false;
        }
        return true;
      case 2:
        if (!formData.username || !formData.password || !formData.confirmPassword) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please fill all account fields' });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match' });
          return false;
        }
        if (formData.password.length < 8) {
          toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 8 characters' });
          return false;
        }
        return true;
      case 3:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
          toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required personal fields' });
          return false;
        }
        if (!formData.educationTypeId) {
          toast({ variant: 'destructive', title: 'Error', description: 'Lütfen eğitim türünüzü seçin' });
          return false;
        }
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 4) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (validateStep(4)) {
      try {
        // Prepare education history
        const educationHistory: any[] = [];
        
        // Add universities
        formData.universities.forEach(uni => {
          if (uni.name && uni.degree) {
            educationHistory.push({
              level: 'Bachelor', // Default, can be improved
              degree: uni.degree,
              institution: uni.name,
              fieldOfStudy: uni.field || undefined,
              graduationDate: uni.graduationYear ? `${uni.graduationYear}-01-01` : undefined,
              isCurrent: false
            });
          }
        });

        // Add high school if provided
        if (formData.highSchool) {
          educationHistory.push({
            level: 'HighSchool',
            degree: 'High School Diploma',
            institution: formData.highSchool,
            isCurrent: false
          });
        }

        // Add middle school if provided
        if (formData.middleSchool) {
          educationHistory.push({
            level: 'MiddleSchool',
            degree: 'Middle School Diploma',
            institution: formData.middleSchool,
            isCurrent: false
          });
        }

        // Validate educationTypeId before submitting
        if (!formData.educationTypeId) {
          toast({
            variant: 'destructive',
            title: '❌ Hata',
            description: 'Lütfen eğitim türünüzü seçin',
          });
          return;
        }

        const tokenDto = await AuthService.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          clientCode: formData.accessCode || undefined,
          phone: formData.phone || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          address: formData.address || undefined,
          nationality: formData.placeOfBirth || undefined, // Using placeOfBirth as nationality
          educationTypeId: formData.educationTypeId, // Required field
          educationHistory: educationHistory.length > 0 ? educationHistory : undefined
        });

        // Token is automatically saved in AuthService.register, just navigate
        toast({
          title: '✅ Registration Successful',
          description: 'Your account has been created successfully. You are now logged in.',
        });
        navigate('/client/dashboard'); // Redirect to client dashboard
      } catch (error: any) {
        console.error('Registration error:', error);
        toast({
          variant: 'destructive',
          title: '❌ Error',
          description: error.message || 'Registration failed. Please try again.',
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white">
                New Client Registration
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Please complete the following steps to create your account.
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-12 flex items-center justify-center rounded-md px-2 transition-all ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : currentStep > step.id
                    ? 'bg-green-500 text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5 mr-2" />
                ) : null}
                <span className="text-sm font-medium truncate">{step.short}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-lg">
          <CardContent className="p-6 sm:p-8 [&_input]:border-2 [&_input]:border-gray-300 dark:[&_input]:border-gray-600">
            {/* Step 1: Access Code */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Step 1: Verify Access
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please enter the unique membership access code provided to you by Worklines Pro to begin your registration.
                </p>
                <div>
                  <Label htmlFor="accessCode">Membership Access Code</Label>
                  <div className="relative">
                    <Input
                      id="accessCode"
                      type="text"
                      placeholder="e.g., WP-12345XYZ"
                      value={formData.accessCode}
                      onChange={(e) => handleInputChange('accessCode', e.target.value)}
                      className="mt-1"
                      disabled={loadingPendingCode}
                    />
                    {loadingPendingCode && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 mt-1">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  {formData.accessCode && !loadingPendingCode && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Müşteri kodu girildiğinde bilgiler otomatik olarak doldurulacaktır.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Account */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Step 2: Create Your Account
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Set up your login credentials. Your password must be at least 8 characters long.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`mt-1 border-2 ${
                        formData.confirmPassword && formData.password !== formData.confirmPassword
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Personal Information */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Step 3: Personal Information
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tell us a little more about yourself.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="placeOfBirth">Place of Birth</Label>
                    <Input
                      id="placeOfBirth"
                      type="text"
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange('placeOfBirth', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="address">Residential Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="educationTypeId">
                      <GraduationCap className="w-4 h-4 inline mr-2" />
                      Eğitim Türü <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.educationTypeId?.toString() || undefined}
                      onValueChange={(value) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          educationTypeId: parseInt(value)
                        }));
                      }}
                      disabled={loadingEducationTypes}
                    >
                      <SelectTrigger className={`mt-1 ${!formData.educationTypeId ? 'border-red-500 dark:border-red-500' : ''}`}>
                        <SelectValue placeholder={loadingEducationTypes ? "Yükleniyor..." : "Eğitim türünüzü seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {educationTypes
                          .filter(type => type.isActive)
                          .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
                          .map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              {getEducationTypeName(type)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    {!formData.educationTypeId && (
                      <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                        Eğitim türü seçimi zorunludur
                      </p>
                    )}
                    {formData.educationTypeId && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Başvuru süreciniz için uygun eğitim türünü seçin
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Education */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Step 4: Educational Background
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Please provide your education history.
                </p>
                <div className="space-y-8">
                  {/* Universities */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">University</h3>
                    {formData.universities.map((uni, index) => (
                      <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg mb-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor={`uni-name-${index}`}>Institution Name</Label>
                            <Input
                              id={`uni-name-${index}`}
                              type="text"
                              value={uni.name}
                              onChange={(e) => handleUniversityChange(index, 'name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`degree-${index}`}>Degree</Label>
                            <Input
                              id={`degree-${index}`}
                              type="text"
                              placeholder="e.g., Bachelor of Science"
                              value={uni.degree}
                              onChange={(e) => handleUniversityChange(index, 'degree', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`field-${index}`}>Field of Study</Label>
                            <Input
                              id={`field-${index}`}
                              type="text"
                              placeholder="e.g., Computer Science"
                              value={uni.field}
                              onChange={(e) => handleUniversityChange(index, 'field', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`grad-year-${index}`}>Graduation Year</Label>
                            <Input
                              id={`grad-year-${index}`}
                              type="text"
                              placeholder="YYYY"
                              value={uni.graduationYear}
                              onChange={(e) => handleUniversityChange(index, 'graduationYear', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addUniversity}
                      className="mt-2"
                    >
                      + Add Another Degree
                    </Button>
                  </div>

                  {/* High School & Middle School */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="highSchool">High School</Label>
                      <Input
                        id="highSchool"
                        type="text"
                        placeholder="School Name"
                        value={formData.highSchool}
                        onChange={(e) => handleInputChange('highSchool', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="middleSchool">Middle School</Label>
                      <Input
                        id="middleSchool"
                        type="text"
                        placeholder="School Name"
                        value={formData.middleSchool}
                        onChange={(e) => handleInputChange('middleSchool', e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Link to="/login">
                  <Button type="button" variant="ghost">
                    Already have an account?
                  </Button>
                </Link>
                {currentStep < 4 ? (
                  <Button type="button" onClick={handleNext}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="button" onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                    Complete Registration
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;

