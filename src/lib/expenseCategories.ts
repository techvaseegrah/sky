import { ExpenseCategory } from '@/types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  {
    id: 'food_purchase',
    name: 'Food Purchase',
    icon: '🍽️',
    subcategories: [
      { id: 'raw_materials', name: 'Raw Materials', description: 'Fresh ingredients, spices, etc.' },
      { id: 'processed_foods', name: 'Processed Foods', description: 'Canned goods, packaged items' },
      { id: 'beverages', name: 'Beverages', description: 'Drinks, juices, tea, coffee' },
      { id: 'dairy_products', name: 'Dairy Products', description: 'Milk, cheese, yogurt' },
      { id: 'frozen_items', name: 'Frozen Items', description: 'Frozen vegetables, ice cream' },
      { id: 'snacks', name: 'Snacks', description: 'Chips, biscuits, candies' }
    ]
  },
  {
    id: 'equipment',
    name: 'Equipment',
    icon: '🔧',
    subcategories: [
      { id: 'kitchen_equipment', name: 'Kitchen Equipment', description: 'Stoves, ovens, mixers' },
      { id: 'serving_equipment', name: 'Serving Equipment', description: 'Plates, cups, utensils' },
      { id: 'cleaning_equipment', name: 'Cleaning Equipment', description: 'Dishwashers, cleaning tools' },
      { id: 'furniture', name: 'Furniture', description: 'Tables, chairs, cabinets' },
      { id: 'electronics', name: 'Electronics', description: 'POS systems, refrigerators' },
      { id: 'maintenance_tools', name: 'Maintenance Tools', description: 'Repair tools, spare parts' }
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '⚡',
    subcategories: [
      { id: 'electricity', name: 'Electricity', description: 'Power bills' },
      { id: 'water', name: 'Water', description: 'Water supply bills' },
      { id: 'gas', name: 'Gas', description: 'Cooking gas, heating' },
      { id: 'internet', name: 'Internet', description: 'Internet connectivity' },
      { id: 'phone', name: 'Phone', description: 'Telephone bills' },
      { id: 'waste_management', name: 'Waste Management', description: 'Garbage collection' }
    ]
  },
  {
    id: 'staff',
    name: 'Staff',
    icon: '👥',
    subcategories: [
      { id: 'salaries', name: 'Salaries', description: 'Monthly staff salaries' },
      { id: 'overtime', name: 'Overtime', description: 'Extra working hours payment' },
      { id: 'benefits', name: 'Benefits', description: 'Health insurance, bonuses' },
      { id: 'training', name: 'Training', description: 'Staff training programs' },
      { id: 'uniforms', name: 'Uniforms', description: 'Staff clothing' },
      { id: 'recruitment', name: 'Recruitment', description: 'Hiring costs' }
    ]
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: '📢',
    subcategories: [
      { id: 'advertising', name: 'Advertising', description: 'Online and offline ads' },
      { id: 'promotions', name: 'Promotions', description: 'Discount campaigns, offers' },
      { id: 'social_media', name: 'Social Media', description: 'Social media marketing' },
      { id: 'printed_materials', name: 'Printed Materials', description: 'Flyers, menus, banners' },
      { id: 'events', name: 'Events', description: 'Special events, celebrations' },
      { id: 'loyalty_programs', name: 'Loyalty Programs', description: 'Customer retention programs' }
    ]
  },
  {
    id: 'maintenance',
    name: 'Maintenance',
    icon: '🔨',
    subcategories: [
      { id: 'equipment_repair', name: 'Equipment Repair', description: 'Fixing kitchen equipment' },
      { id: 'facility_maintenance', name: 'Facility Maintenance', description: 'Building repairs, painting' },
      { id: 'pest_control', name: 'Pest Control', description: 'Pest management services' },
      { id: 'deep_cleaning', name: 'Deep Cleaning', description: 'Professional cleaning services' },
      { id: 'hvac', name: 'HVAC', description: 'Air conditioning, ventilation' },
      { id: 'plumbing', name: 'Plumbing', description: 'Water system repairs' }
    ]
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📋',
    subcategories: [
      { id: 'licenses', name: 'Licenses', description: 'Business licenses, permits' },
      { id: 'insurance', name: 'Insurance', description: 'Business insurance' },
      { id: 'accounting', name: 'Accounting', description: 'Accountant fees, software' },
      { id: 'legal', name: 'Legal', description: 'Legal consultation fees' },
      { id: 'bank_charges', name: 'Bank Charges', description: 'Banking fees, transaction charges' },
      { id: 'miscellaneous', name: 'Miscellaneous', description: 'Other unexpected expenses' }
    ]
  }
];

export const getCategoryById = (id: string): ExpenseCategory | undefined => {
  return EXPENSE_CATEGORIES.find(category => category.id === id);
};

export const getSubcategoryById = (categoryId: string, subcategoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories.find(sub => sub.id === subcategoryId);
};

export const getAllSubcategories = () => {
  return EXPENSE_CATEGORIES.flatMap(category => 
    category.subcategories.map(sub => ({
      ...sub,
      categoryId: category.id,
      categoryName: category.name
    }))
  );
};

export const getSubcategoriesByCategory = (categoryId: string) => {
  const category = getCategoryById(categoryId);
  return category?.subcategories || [];
};