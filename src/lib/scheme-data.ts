/**
 * Government Scheme Data with Category Mappings
 * 
 * This file contains the complete dataset of government schemes organized
 * by artisan categories based on income level and digital literacy.
 */

import { SchemeWithCategory, CategoryType } from '@/types/artisan-categories';

// ============================================================================
// Low-Income Individual Artisan Schemes
// ============================================================================

/**
 * Schemes for Low-Income Individual Artisans (Digitally Unaware)
 * Income: < ₹3 lakh per year
 * Digital Literacy: Digitally Unaware
 */
const LOW_INCOME_INDIVIDUAL_SCHEMES: SchemeWithCategory[] = [
  {
    id: 'pm-vishwakarma-yojana',
    title: 'PM Vishwakarma Yojana',
    description: 'Comprehensive scheme for traditional artisans providing skill training, toolkit incentives, and collateral-free credit support. Covers 18 traditional trades including carpentry, blacksmithy, pottery, weaving, and more.',
    categories: ['low-income-individual'],
    loanAmount: {
      min: 100000,
      max: 300000,
      currency: 'INR',
    },
    interestRate: {
      original: 8,
      subsidized: 5,
      subventionPercentage: 3,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Traditional artisans in 18 specified trades',
      'Minimum age 18 years',
      'Self-employed or own-account workers',
      'Not availed similar credit-based schemes in the past',
    ],
    applicationUrl: 'https://pmvishwakarma.gov.in/',
    benefits: [
      'Collateral-free loans: ₹1 lakh (first tranche) + ₹2 lakh (second tranche)',
      '5% interest rate with 3% interest subvention',
      'Free skill training (5-7 days basic + 15 days advanced)',
      'Toolkit incentive of ₹15,000',
      'Monthly stipend of ₹500 during training',
      'Digital transaction incentive of ₹1 per transaction (up to 100 transactions/month)',
      'Marketing support and brand promotion',
    ],
    categoryRelevance: {
      'low-income-individual': 100,
      'family-based': 40,
      'cooperative-cluster': 0,
      'sme-scale': 0,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 100000,
        max: 300000,
        currency: 'INR',
      },
      interestRate: {
        original: 8,
        subsidized: 5,
        subventionPercentage: 3,
      },
      subsidies: [
        {
          type: 'training',
          percentage: 100,
          maxAmount: 15000,
          eligibility: ['All eligible artisans'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '18 months repayment period with no prepayment penalty',
    },
    targetAudience: {
      incomeLevel: ['low'],
      businessScale: ['Individual artisan', 'No employees'],
      digitalRequirement: 'None - scheme includes digital literacy training',
    },
  },
  
  {
    id: 'pmmy-shishu',
    title: 'Pradhan Mantri Mudra Yojana (PMMY) - Shishu',
    description: 'Collateral-free micro-credit scheme for small businesses and artisans. Shishu category provides loans up to ₹50,000 for starting or expanding micro-enterprises.',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 10000,
      max: 50000,
      currency: 'INR',
      categories: {
        shishu: 50000,
      },
    },
    interestRate: {
      original: 10,
      subsidized: 8,
      subventionPercentage: 2,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Small business owners and artisans',
      'Income-generating activities in manufacturing, trading, or services',
      'Non-corporate, non-farm small/micro enterprises',
    ],
    applicationUrl: 'https://www.mudra.org.in/',
    benefits: [
      'Collateral-free loans up to ₹50,000',
      'Lower interest rates (8-10%)',
      'No processing fees',
      'Flexible repayment terms',
      'Mudra Card for easy access to working capital',
    ],
    categoryRelevance: {
      'low-income-individual': 100,
      'family-based': 80,
      'cooperative-cluster': 0,
      'sme-scale': 0,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 10000,
        max: 50000,
        currency: 'INR',
        categories: {
          shishu: 50000,
        },
      },
      interestRate: {
        original: 10,
        subsidized: 8,
        subventionPercentage: 2,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Up to 5 years depending on loan amount and business type',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium'],
      businessScale: ['Individual', 'Micro-enterprise'],
      digitalRequirement: 'Basic - for loan application',
    },
  },

  {
    id: 'pmmy-kishor',
    title: 'Pradhan Mantri Mudra Yojana (PMMY) - Kishor',
    description: 'Mid-level Mudra loan for established micro-enterprises looking to expand. Kishor category provides loans from ₹50,001 to ₹5 lakh for business growth.',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 50001,
      max: 500000,
      currency: 'INR',
      categories: {
        kishor: 500000,
      },
    },
    interestRate: {
      original: 10,
      subsidized: 8,
      subventionPercentage: 2,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Existing micro-enterprises seeking expansion',
      'Businesses that have availed Shishu loans and repaid successfully',
      'Income-generating activities in manufacturing, trading, or services',
    ],
    applicationUrl: 'https://www.mudra.org.in/',
    benefits: [
      'Collateral-free loans from ₹50,001 to ₹5 lakh',
      'Competitive interest rates (8-10%)',
      'No processing fees',
      'Working capital and term loan options',
      'Mudra Card facility',
    ],
    categoryRelevance: {
      'low-income-individual': 90,
      'family-based': 100,
      'cooperative-cluster': 20,
      'sme-scale': 0,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 50001,
        max: 500000,
        currency: 'INR',
        categories: {
          kishor: 500000,
        },
      },
      interestRate: {
        original: 10,
        subsidized: 8,
        subventionPercentage: 2,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Up to 5 years with flexible EMI options',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium'],
      businessScale: ['Individual to small family unit', '1-3 employees'],
      digitalRequirement: 'Basic - for loan application and tracking',
    },
  },
  
  {
    id: 'pmmy-tarun',
    title: 'Pradhan Mantri Mudra Yojana (PMMY) - Tarun',
    description: 'Highest tier of Mudra loans for well-established micro-enterprises. Tarun category provides loans from ₹5 lakh to ₹10 lakh for significant business expansion.',
    categories: ['low-income-individual', 'family-based', 'cooperative-cluster'],
    loanAmount: {
      min: 500001,
      max: 1000000,
      currency: 'INR',
      categories: {
        tarun: 1000000,
      },
    },
    interestRate: {
      original: 10,
      subsidized: 8,
      subventionPercentage: 2,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Well-established micro-enterprises',
      'Businesses with proven track record',
      'Seeking substantial expansion or equipment purchase',
    ],
    applicationUrl: 'https://www.mudra.org.in/',
    benefits: [
      'Collateral-free loans from ₹5 lakh to ₹10 lakh',
      'Competitive interest rates',
      'Suitable for equipment purchase and expansion',
      'Working capital support',
      'Credit guarantee coverage',
    ],
    categoryRelevance: {
      'low-income-individual': 70,
      'family-based': 100,
      'cooperative-cluster': 80,
      'sme-scale': 40,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 500001,
        max: 1000000,
        currency: 'INR',
        categories: {
          tarun: 1000000,
        },
      },
      interestRate: {
        original: 10,
        subsidized: 8,
        subventionPercentage: 2,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Up to 7 years depending on business plan',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium', 'medium'],
      businessScale: ['Small family business', '3-10 employees'],
      digitalRequirement: 'Basic to moderate - for application and business management',
    },
  },
  
  {
    id: 'stand-up-india',
    title: 'Stand-Up India Scheme',
    description: 'Facilitates bank loans for SC/ST and women entrepreneurs to set up greenfield enterprises in manufacturing, services, or trading sectors. Provides loans between ₹10 lakh and ₹1 crore.',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 1000000,
      max: 10000000,
      currency: 'INR',
    },
    interestRate: {
      original: 9.5,
      subsidized: 7.5,
      subventionPercentage: 2,
    },
    subsidyPercentage: 0,
    collateralFree: false,
    eligibility: [
      'SC/ST and/or women entrepreneurs',
      'Age 18 years or above',
      'Setting up greenfield enterprise (manufacturing, services, or trading)',
      'Loan for non-farm sector only',
      'At least one SC/ST and one woman entrepreneur per bank branch',
    ],
    applicationUrl: 'https://www.standupmitra.in/',
    benefits: [
      'Loans between ₹10 lakh and ₹1 crore',
      'Composite loan including term loan and working capital',
      'Credit Guarantee Fund coverage',
      'Handholding support for loan application',
      'Convergence with other government schemes',
    ],
    categoryRelevance: {
      'low-income-individual': 85,
      'family-based': 100,
      'cooperative-cluster': 60,
      'sme-scale': 40,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 1000000,
        max: 10000000,
        currency: 'INR',
      },
      interestRate: {
        original: 9.5,
        subsidized: 7.5,
        subventionPercentage: 2,
      },
      subsidies: [],
      collateralFree: false,
      repaymentTerms: '7 years with moratorium period of up to 18 months',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium', 'medium'],
      businessScale: ['Greenfield enterprise', 'New business setup'],
      digitalRequirement: 'Basic - for application and documentation',
    },
  },
  
  {
    id: 'day-nrlm',
    title: 'Deendayal Antyodaya Yojana - National Rural Livelihoods Mission (DAY-NRLM)',
    description: 'Promotes self-employment and organization of rural poor through Self-Help Groups (SHGs). Provides financial assistance, skill training, and market linkages for rural artisans.',
    categories: ['low-income-individual', 'family-based', 'cooperative-cluster'],
    loanAmount: {
      min: 50000,
      max: 500000,
      currency: 'INR',
    },
    interestRate: {
      original: 7,
      subsidized: 4,
      subventionPercentage: 3,
    },
    subsidyPercentage: 30,
    collateralFree: true,
    eligibility: [
      'Rural poor households',
      'Members of Self-Help Groups (SHGs)',
      'Women artisans and entrepreneurs',
      'Below Poverty Line (BPL) families',
    ],
    applicationUrl: 'https://nrlm.gov.in/',
    benefits: [
      'Collateral-free loans through SHGs',
      'Interest subvention of 3% (effective rate 4%)',
      'Additional 3% interest subvention on prompt repayment',
      'Revolving Fund support of ₹15,000 per SHG',
      'Community Investment Fund of ₹10-15 lakh per SHG',
      'Skill training and capacity building',
      'Market linkages and value chain support',
    ],
    categoryRelevance: {
      'low-income-individual': 100,
      'family-based': 90,
      'cooperative-cluster': 100,
      'sme-scale': 0,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 50000,
        max: 500000,
        currency: 'INR',
      },
      interestRate: {
        original: 7,
        subsidized: 4,
        subventionPercentage: 3,
      },
      subsidies: [
        {
          type: 'training',
          percentage: 100,
          eligibility: ['SHG members'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years with flexible repayment schedule',
    },
    targetAudience: {
      incomeLevel: ['low'],
      businessScale: ['Individual artisan', 'SHG member'],
      digitalRequirement: 'None - SHG provides support',
    },
  },
  
  {
    id: 'tread',
    title: 'Trade Related Entrepreneurship Assistance and Development (TREAD)',
    description: 'Scheme for women entrepreneurs providing credit and training. Includes 30% grant component for NGOs/institutions to provide training and counseling to women beneficiaries.',
    categories: ['low-income-individual', 'family-based'],
    loanAmount: {
      min: 100000,
      max: 1000000,
      currency: 'INR',
    },
    interestRate: {
      original: 8,
      subsidized: 5,
      subventionPercentage: 3,
    },
    subsidyPercentage: 30,
    collateralFree: true,
    eligibility: [
      'Women entrepreneurs and artisans',
      'NGOs/institutions working with women beneficiaries',
      'Economically disadvantaged women',
      'Women in traditional crafts and trades',
    ],
    applicationUrl: 'https://msme.gov.in/tread-scheme',
    benefits: [
      'Collateral-free loans for women entrepreneurs',
      '30% grant to NGOs for training and counseling',
      'Interest subvention of 3%',
      'Entrepreneurship development training',
      'Business counseling and mentorship',
      'Market linkage support',
    ],
    categoryRelevance: {
      'low-income-individual': 100,
      'family-based': 90,
      'cooperative-cluster': 40,
      'sme-scale': 0,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 100000,
        max: 1000000,
        currency: 'INR',
      },
      interestRate: {
        original: 8,
        subsidized: 5,
        subventionPercentage: 3,
      },
      subsidies: [
        {
          type: 'training',
          percentage: 30,
          eligibility: ['Women entrepreneurs through NGOs'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '5-7 years with moratorium period',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium'],
      businessScale: ['Individual women artisan', 'Small women-led enterprise'],
      digitalRequirement: 'Basic - training provided',
    },
  },
];


// ============================================================================
// Family-Based Artisan Schemes
// ============================================================================

/**
 * Schemes for Family-Based Artisans (Low-Medium Income, Semi-Digital)
 * Income: ₹3-10 lakh per year
 * Digital Literacy: Semi-Digital
 */
const FAMILY_BASED_SCHEMES: SchemeWithCategory[] = [
  {
    id: 'pmegp',
    title: 'Prime Minister Employment Generation Programme (PMEGP)',
    description: 'Credit-linked subsidy scheme for setting up new micro-enterprises in manufacturing and service sectors. Provides margin money subsidy of 15-35% of project cost.',
    categories: ['family-based', 'cooperative-cluster'],
    loanAmount: {
      min: 100000,
      max: 2500000,
      currency: 'INR',
    },
    interestRate: {
      original: 8.5,
      subsidized: 8.5,
      subventionPercentage: 0,
    },
    subsidyPercentage: 35,
    collateralFree: false,
    eligibility: [
      'Age 18 years or above',
      'Minimum 8th standard pass for projects above ₹10 lakh',
      'No income limit for general category',
      'Existing units not eligible',
      'Self-Help Groups, institutions, and cooperative societies eligible',
    ],
    applicationUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    benefits: [
      'Margin money subsidy: 35% (special category), 25% (general category) for urban areas',
      'Margin money subsidy: 35% (special category), 25% (general category) for rural areas',
      'Maximum subsidy: ₹25 lakh for manufacturing, ₹10 lakh for services',
      'Working capital and term loan support',
      'Entrepreneurship development training',
      'Marketing and handholding support',
    ],
    categoryRelevance: {
      'low-income-individual': 40,
      'family-based': 100,
      'cooperative-cluster': 90,
      'sme-scale': 50,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 100000,
        max: 2500000,
        currency: 'INR',
      },
      interestRate: {
        original: 8.5,
        subsidized: 8.5,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'margin-money',
          percentage: 35,
          maxAmount: 2500000,
          eligibility: ['Special category (SC/ST/OBC/Minorities/Women/Physically Handicapped/Ex-servicemen/Hill & Border areas)'],
        },
        {
          type: 'margin-money',
          percentage: 25,
          maxAmount: 2500000,
          eligibility: ['General category'],
        },
      ],
      collateralFree: false,
      repaymentTerms: '3-7 years depending on project type with moratorium period',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium'],
      businessScale: ['Family-run unit', '2-10 employees'],
      digitalRequirement: 'Basic - for online application',
    },
  },
  
  {
    id: 'nhdp',
    title: 'National Handloom Development Programme (NHDP)',
    description: 'Comprehensive scheme for handloom weavers providing financial assistance, technology upgrades, marketing support, and skill development. Includes up to 100% subsidy for BPL/SC/ST weavers.',
    categories: ['family-based', 'cooperative-cluster'],
    loanAmount: {
      min: 50000,
      max: 1000000,
      currency: 'INR',
    },
    interestRate: {
      original: 7,
      subsidized: 4,
      subventionPercentage: 3,
    },
    subsidyPercentage: 100,
    collateralFree: true,
    eligibility: [
      'Handloom weavers and artisans',
      'Handloom cooperatives and SHGs',
      'Weavers registered with Handloom Census',
      'BPL/SC/ST weavers get priority',
    ],
    applicationUrl: 'https://handlooms.nic.in/',
    benefits: [
      'Up to 100% subsidy for BPL/SC/ST weavers for equipment',
      '90% subsidy for general category weavers',
      'Collateral-free credit through Weavers Credit Card',
      'Interest subvention of 3%',
      'Yarn supply at subsidized rates',
      'Marketing support through exhibitions and fairs',
      'Skill upgradation and design development training',
      'Health insurance coverage (₹15,000 per annum)',
    ],
    categoryRelevance: {
      'low-income-individual': 70,
      'family-based': 100,
      'cooperative-cluster': 100,
      'sme-scale': 30,
      'export-oriented': 40,
    },
    financialDetails: {
      loanAmount: {
        min: 50000,
        max: 1000000,
        currency: 'INR',
      },
      interestRate: {
        original: 7,
        subsidized: 4,
        subventionPercentage: 3,
      },
      subsidies: [
        {
          type: 'equipment',
          percentage: 100,
          eligibility: ['BPL/SC/ST weavers'],
        },
        {
          type: 'equipment',
          percentage: 90,
          eligibility: ['General category weavers'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years with flexible repayment',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium', 'medium'],
      businessScale: ['Individual weaver', 'Family weaving unit', 'Small cooperative'],
      digitalRequirement: 'Basic - for registration and credit card',
    },
  },
  
  {
    id: 'mahila-coir-yojana',
    title: 'Mahila Coir Yojana',
    description: 'Scheme for women in coir industry providing equipment subsidy, training, and marketing support. Offers 75% subsidy on motorized equipment and 100% training cost coverage.',
    categories: ['family-based', 'cooperative-cluster'],
    loanAmount: {
      min: 50000,
      max: 500000,
      currency: 'INR',
    },
    interestRate: {
      original: 6,
      subsidized: 4,
      subventionPercentage: 2,
    },
    subsidyPercentage: 75,
    collateralFree: true,
    eligibility: [
      'Women workers in coir industry',
      'Women-led coir cooperatives',
      'Women entrepreneurs in coir sector',
      'Priority to BPL women',
    ],
    applicationUrl: 'https://coirboard.gov.in/',
    benefits: [
      '75% subsidy on motorized equipment (spinning, weaving, dyeing)',
      '100% training cost coverage',
      'Interest subvention of 2%',
      'Raw material supply support',
      'Marketing assistance through Coir Board',
      'Quality certification support',
      'Export promotion assistance',
    ],
    categoryRelevance: {
      'low-income-individual': 60,
      'family-based': 100,
      'cooperative-cluster': 90,
      'sme-scale': 40,
      'export-oriented': 50,
    },
    financialDetails: {
      loanAmount: {
        min: 50000,
        max: 500000,
        currency: 'INR',
      },
      interestRate: {
        original: 6,
        subsidized: 4,
        subventionPercentage: 2,
      },
      subsidies: [
        {
          type: 'equipment',
          percentage: 75,
          maxAmount: 375000,
          eligibility: ['Women in coir industry'],
        },
        {
          type: 'training',
          percentage: 100,
          eligibility: ['All women beneficiaries'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years with moratorium period',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium'],
      businessScale: ['Individual women worker', 'Family coir unit', 'Women cooperative'],
      digitalRequirement: 'Basic - for application and documentation',
    },
  },
  
  {
    id: 'myuva',
    title: 'Mukhyamantri Yuva Udyami Vikas Abhiyan (MYUVA) - Uttar Pradesh',
    description: 'State scheme for young entrepreneurs in Uttar Pradesh providing interest-free loans for setting up new enterprises. Offers ₹5-7.5 lakh interest-free loans with margin money subsidy.',
    categories: ['family-based', 'sme-scale'],
    loanAmount: {
      min: 500000,
      max: 750000,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 25,
    collateralFree: false,
    eligibility: [
      'Age 18-40 years',
      'Resident of Uttar Pradesh',
      'Minimum 10th standard pass',
      'Annual family income less than ₹6 lakh',
      'Not defaulter of any bank/financial institution',
    ],
    applicationUrl: 'https://diupmsme.upsdc.gov.in/',
    benefits: [
      'Interest-free loans of ₹5-7.5 lakh',
      '25% margin money subsidy',
      'No collateral for loans up to ₹10 lakh',
      '7-year repayment period',
      'Entrepreneurship training',
      'Handholding support for 2 years',
    ],
    categoryRelevance: {
      'low-income-individual': 30,
      'family-based': 100,
      'cooperative-cluster': 60,
      'sme-scale': 80,
      'export-oriented': 0,
    },
    financialDetails: {
      loanAmount: {
        min: 500000,
        max: 750000,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'margin-money',
          percentage: 25,
          maxAmount: 187500,
          eligibility: ['Young entrepreneurs in UP'],
        },
      ],
      collateralFree: false,
      repaymentTerms: '7 years with 6-month moratorium',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium'],
      businessScale: ['New enterprise', 'Family business'],
      digitalRequirement: 'Moderate - for online application and tracking',
    },
  },
  
  {
    id: 'msme-edp',
    title: 'MSME Entrepreneurship Development Programme (EDP)',
    description: 'Training and skill development programme for aspiring entrepreneurs with stipend support. Provides comprehensive training in business planning, financial management, and marketing.',
    categories: ['family-based', 'sme-scale'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 100,
    collateralFree: true,
    eligibility: [
      'Aspiring entrepreneurs',
      'Minimum 8th standard pass',
      'Age 18 years or above',
      'Unemployed youth and artisans',
    ],
    applicationUrl: 'https://msme.gov.in/',
    benefits: [
      'Free entrepreneurship training (2-6 weeks)',
      'Stipend of ₹500-₹1,000 per month during training',
      'Business plan development support',
      'Financial management training',
      'Marketing and sales training',
      'Handholding support post-training',
      'Linkage with credit institutions',
    ],
    categoryRelevance: {
      'low-income-individual': 70,
      'family-based': 100,
      'cooperative-cluster': 80,
      'sme-scale': 90,
      'export-oriented': 40,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'training',
          percentage: 100,
          maxAmount: 6000,
          eligibility: ['All aspiring entrepreneurs'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Not applicable - training programme',
    },
    targetAudience: {
      incomeLevel: ['low', 'low-medium', 'medium'],
      businessScale: ['Aspiring entrepreneur', 'New business'],
      digitalRequirement: 'Basic - for registration',
    },
  },
];


// ============================================================================
// Cooperative/Cluster Artisan Schemes
// ============================================================================

/**
 * Schemes for Cooperative/Cluster Artisans (Medium Income, Semi-Digital)
 * Income: ₹10-50 lakh per year
 * Digital Literacy: Semi-Digital
 */
const COOPERATIVE_CLUSTER_SCHEMES: SchemeWithCategory[] = [
  {
    id: 'ahvy',
    title: 'Ambedkar Hastshilp Vikas Yojana (AHVY)',
    description: 'Comprehensive scheme for artisan clusters providing infrastructure development, skill training, design support, and marketing assistance. Focuses on cluster-based development approach.',
    categories: ['cooperative-cluster'],
    loanAmount: {
      min: 1000000,
      max: 10000000,
      currency: 'INR',
    },
    interestRate: {
      original: 7,
      subsidized: 5,
      subventionPercentage: 2,
    },
    subsidyPercentage: 80,
    collateralFree: false,
    eligibility: [
      'Artisan clusters with minimum 50 artisans',
      'Registered cooperatives and producer companies',
      'Traditional craft clusters',
      'Priority to SC/ST artisan clusters',
    ],
    applicationUrl: 'https://handicrafts.nic.in/',
    benefits: [
      'Infrastructure development grants (80% subsidy)',
      'Common Facility Centre (CFC) establishment',
      'Modern equipment and machinery support',
      'Design and product development assistance',
      'Marketing support through exhibitions',
      'Skill upgradation training',
      'Quality certification support',
      'Working capital assistance',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 40,
      'cooperative-cluster': 100,
      'sme-scale': 60,
      'export-oriented': 50,
    },
    financialDetails: {
      loanAmount: {
        min: 1000000,
        max: 10000000,
        currency: 'INR',
      },
      interestRate: {
        original: 7,
        subsidized: 5,
        subventionPercentage: 2,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 80,
          maxAmount: 8000000,
          eligibility: ['Artisan clusters with 50+ members'],
        },
      ],
      collateralFree: false,
      repaymentTerms: '5-7 years with moratorium period',
    },
    targetAudience: {
      incomeLevel: ['medium'],
      businessScale: ['Cluster of 50+ artisans', 'Cooperative society'],
      digitalRequirement: 'Semi-digital - basic online presence',
    },
  },
  
  {
    id: 'sfurti',
    title: 'Scheme of Fund for Regeneration of Traditional Industries (SFURTI)',
    description: 'Cluster development scheme providing Common Facility Centres, infrastructure, and capacity building for traditional industries. Offers 90% grant for soft interventions and 80% for hard interventions.',
    categories: ['cooperative-cluster', 'sme-scale'],
    loanAmount: {
      min: 2500000,
      max: 25000000,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 90,
    collateralFree: true,
    eligibility: [
      'Traditional industry clusters',
      'Minimum 500 artisans/workers in cluster',
      'Khadi, village industries, coir, and handicraft clusters',
      'Registered SPV (Special Purpose Vehicle) required',
    ],
    applicationUrl: 'https://sfurti.msme.gov.in/',
    benefits: [
      '90% grant for soft interventions (training, design, marketing)',
      '80% grant for hard interventions (CFC, equipment, infrastructure)',
      'Maximum grant: ₹2.5 crore per cluster',
      'Common Facility Centre establishment',
      'Raw material banks and warehouses',
      'Marketing and branding support',
      'Technology upgradation',
      'Backward and forward linkages',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 30,
      'cooperative-cluster': 100,
      'sme-scale': 80,
      'export-oriented': 60,
    },
    financialDetails: {
      loanAmount: {
        min: 2500000,
        max: 25000000,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 80,
          maxAmount: 20000000,
          eligibility: ['Hard interventions - CFC, equipment'],
        },
        {
          type: 'training',
          percentage: 90,
          maxAmount: 22500000,
          eligibility: ['Soft interventions - training, marketing'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Grant-based - no repayment required',
    },
    targetAudience: {
      incomeLevel: ['medium', 'medium-high'],
      businessScale: ['Large cluster (500+ artisans)', 'Registered SPV'],
      digitalRequirement: 'Semi-digital - for reporting and documentation',
    },
  },
  
  {
    id: 'kgvy',
    title: 'Khadi & Gramodyog Vikas Yojana (KGVY)',
    description: 'Comprehensive scheme for khadi and village industries providing credit, interest subvention, infrastructure support, and marketing assistance. Offers 7% interest subvention on working capital loans.',
    categories: ['cooperative-cluster', 'family-based'],
    loanAmount: {
      min: 500000,
      max: 5000000,
      currency: 'INR',
    },
    interestRate: {
      original: 11,
      subsidized: 4,
      subventionPercentage: 7,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Khadi institutions registered with KVIC',
      'Village industry units',
      'Artisan cooperatives in khadi sector',
      'Individual khadi artisans',
    ],
    applicationUrl: 'https://www.kvic.gov.in/',
    benefits: [
      '7% interest subvention on working capital loans',
      'Collateral-free credit up to ₹50 lakh',
      'Margin money assistance (15-20%)',
      'Infrastructure development support',
      'Marketing assistance through Khadi outlets',
      'Technology upgradation grants',
      'Training and skill development',
      'Raw material supply support',
    ],
    categoryRelevance: {
      'low-income-individual': 50,
      'family-based': 80,
      'cooperative-cluster': 100,
      'sme-scale': 60,
      'export-oriented': 30,
    },
    financialDetails: {
      loanAmount: {
        min: 500000,
        max: 5000000,
        currency: 'INR',
      },
      interestRate: {
        original: 11,
        subsidized: 4,
        subventionPercentage: 7,
      },
      subsidies: [
        {
          type: 'margin-money',
          percentage: 20,
          maxAmount: 1000000,
          eligibility: ['Khadi institutions'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years for term loans, 1 year for working capital',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium'],
      businessScale: ['Khadi institution', 'Village industry unit', 'Cooperative'],
      digitalRequirement: 'Basic to semi-digital',
    },
  },
  
  {
    id: 'kumhar-sashaktikaran',
    title: 'Kumhar Sashaktikaran Programme',
    description: 'Scheme for potter communities providing modern equipment, skill training, and marketing support. Offers 75% subsidy on electric pottery wheels, blungers, and pug mills.',
    categories: ['cooperative-cluster', 'family-based'],
    loanAmount: {
      min: 100000,
      max: 1000000,
      currency: 'INR',
    },
    interestRate: {
      original: 6,
      subsidized: 4,
      subventionPercentage: 2,
    },
    subsidyPercentage: 75,
    collateralFree: true,
    eligibility: [
      'Traditional potters (Kumhars)',
      'Potter cooperatives and clusters',
      'Minimum 10 potters for cluster support',
      'Priority to SC/ST potters',
    ],
    applicationUrl: 'https://www.kvic.gov.in/kumhar/',
    benefits: [
      '75% subsidy on electric pottery wheels',
      '75% subsidy on blungers and pug mills',
      '75% subsidy on kilns and drying equipment',
      'Free skill training in modern pottery techniques',
      'Design development support',
      'Marketing assistance through exhibitions',
      'Raw material supply at subsidized rates',
      'Quality certification support',
    ],
    categoryRelevance: {
      'low-income-individual': 60,
      'family-based': 90,
      'cooperative-cluster': 100,
      'sme-scale': 40,
      'export-oriented': 30,
    },
    financialDetails: {
      loanAmount: {
        min: 100000,
        max: 1000000,
        currency: 'INR',
      },
      interestRate: {
        original: 6,
        subsidized: 4,
        subventionPercentage: 2,
      },
      subsidies: [
        {
          type: 'equipment',
          percentage: 75,
          maxAmount: 750000,
          eligibility: ['Traditional potters and cooperatives'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years with flexible repayment',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium'],
      businessScale: ['Individual potter', 'Potter cooperative', 'Cluster of 10+ potters'],
      digitalRequirement: 'Basic - for application',
    },
  },
  
  {
    id: 'msme-cdp',
    title: 'MSME Cluster Development Programme (CDP)',
    description: 'Cluster-based approach for MSME development providing diagnostic studies, capacity building, and infrastructure support. Offers 90% grant for women and SC/ST clusters.',
    categories: ['cooperative-cluster', 'sme-scale'],
    loanAmount: {
      min: 5000000,
      max: 50000000,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 90,
    collateralFree: true,
    eligibility: [
      'MSME clusters with minimum 50 units',
      'Registered SPV or cluster association',
      'Women-led clusters get priority',
      'SC/ST clusters get priority',
    ],
    applicationUrl: 'https://msme.gov.in/cluster-development',
    benefits: [
      '90% grant for women and SC/ST clusters',
      '80% grant for general clusters',
      'Diagnostic study and action plan development',
      'Common Facility Centre establishment',
      'Technology upgradation support',
      'Marketing and branding assistance',
      'Quality certification support',
      'Capacity building and training',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 40,
      'cooperative-cluster': 100,
      'sme-scale': 90,
      'export-oriented': 70,
    },
    financialDetails: {
      loanAmount: {
        min: 5000000,
        max: 50000000,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 90,
          maxAmount: 45000000,
          eligibility: ['Women and SC/ST clusters'],
        },
        {
          type: 'infrastructure',
          percentage: 80,
          maxAmount: 40000000,
          eligibility: ['General clusters'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Grant-based - no repayment required',
    },
    targetAudience: {
      incomeLevel: ['medium', 'medium-high'],
      businessScale: ['MSME cluster (50+ units)', 'Registered SPV'],
      digitalRequirement: 'Semi-digital to fully digital',
    },
  },
];


// ============================================================================
// SME-Scale Artisan Schemes
// ============================================================================

/**
 * Schemes for SME-Scale Artisans (Medium-High Income, Fully Digital)
 * Income: ₹50 lakh - ₹5 crore per year
 * Digital Literacy: Fully Digital
 */
const SME_SCALE_SCHEMES: SchemeWithCategory[] = [
  {
    id: 'ondc',
    title: 'Open Network for Digital Commerce (ONDC)',
    description: 'Government-backed digital marketplace platform enabling artisans and MSMEs to sell products online without platform fees. Provides equal access to digital commerce infrastructure.',
    categories: ['sme-scale', 'export-oriented'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Registered MSMEs',
      'Artisan enterprises with digital capability',
      'GST registration required',
      'Product quality standards compliance',
    ],
    applicationUrl: 'https://ondc.org/',
    benefits: [
      'Zero platform commission fees',
      'Access to pan-India customer base',
      'Integrated payment and logistics',
      'Digital catalog creation support',
      'Marketing and promotional support',
      'Training on digital commerce',
      'Analytics and business insights',
      'Level playing field with large e-commerce platforms',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 30,
      'cooperative-cluster': 60,
      'sme-scale': 100,
      'export-oriented': 90,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Not applicable - marketplace platform',
    },
    targetAudience: {
      incomeLevel: ['medium-high', 'high'],
      businessScale: ['Registered MSME', '10-50 employees'],
      digitalRequirement: 'Fully digital - online selling capability',
    },
  },
  
  {
    id: 'cgtmse',
    title: 'Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)',
    description: 'Credit guarantee scheme enabling collateral-free loans up to ₹5 crore for MSMEs. Provides guarantee coverage to lending institutions, making credit accessible without collateral.',
    categories: ['sme-scale', 'cooperative-cluster'],
    loanAmount: {
      min: 1000000,
      max: 50000000,
      currency: 'INR',
    },
    interestRate: {
      original: 9,
      subsidized: 9,
      subventionPercentage: 0,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Micro and small enterprises',
      'Manufacturing and service sector units',
      'New and existing enterprises',
      'Loans from eligible lending institutions',
    ],
    applicationUrl: 'https://www.cgtmse.in/',
    benefits: [
      'Collateral-free loans up to ₹5 crore',
      '85% guarantee coverage for loans up to ₹5 lakh',
      '80% guarantee coverage for loans ₹5 lakh to ₹5 crore',
      'Reduced interest rates due to guarantee',
      'Faster loan processing',
      'Both term loans and working capital covered',
      'Composite loans for equipment and working capital',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 40,
      'cooperative-cluster': 80,
      'sme-scale': 100,
      'export-oriented': 70,
    },
    financialDetails: {
      loanAmount: {
        min: 1000000,
        max: 50000000,
        currency: 'INR',
      },
      interestRate: {
        original: 9,
        subsidized: 9,
        subventionPercentage: 0,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: '5-10 years depending on loan type and amount',
    },
    targetAudience: {
      incomeLevel: ['medium', 'medium-high'],
      businessScale: ['Micro and small enterprises', 'Up to 50 employees'],
      digitalRequirement: 'Moderate - for loan application and documentation',
    },
  },
  
  {
    id: 'msme-champions',
    title: 'MSME Champions Scheme',
    description: 'Scheme to create national and international champions in MSME sector. Provides 15% capital subsidy for technology upgradation and quality certification support.',
    categories: ['sme-scale', 'export-oriented'],
    loanAmount: {
      min: 5000000,
      max: 100000000,
      currency: 'INR',
    },
    interestRate: {
      original: 8,
      subsidized: 8,
      subventionPercentage: 0,
    },
    subsidyPercentage: 15,
    collateralFree: false,
    eligibility: [
      'MSMEs with growth potential',
      'Turnover above ₹10 crore',
      'Export-oriented or import substitution units',
      'Technology-driven enterprises',
      'Quality certification (ISO/BIS)',
    ],
    applicationUrl: 'https://msme.gov.in/champions',
    benefits: [
      '15% capital subsidy for technology upgradation (CLCSS)',
      'Maximum subsidy: ₹15 lakh',
      'Lean manufacturing support',
      'ZED (Zero Defect Zero Effect) certification',
      'IPR support and patent filing assistance',
      'Marketing and branding support',
      'Access to government procurement (GeM)',
      'Export promotion assistance',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 0,
      'cooperative-cluster': 40,
      'sme-scale': 100,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 5000000,
        max: 100000000,
        currency: 'INR',
      },
      interestRate: {
        original: 8,
        subsidized: 8,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'equipment',
          percentage: 15,
          maxAmount: 1500000,
          eligibility: ['MSMEs for technology upgradation'],
        },
      ],
      collateralFree: false,
      repaymentTerms: '7-10 years depending on project',
    },
    targetAudience: {
      incomeLevel: ['medium-high', 'high'],
      businessScale: ['Established MSME', '50+ employees', 'Turnover ₹10+ crore'],
      digitalRequirement: 'Fully digital - ERP, online presence',
    },
  },
  
  {
    id: 'gem',
    title: 'Government e-Marketplace (GeM)',
    description: 'Online platform for government procurement providing direct access to government buyers. Enables artisan enterprises to sell products and services to government departments.',
    categories: ['sme-scale', 'cooperative-cluster'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Registered MSMEs',
      'GST registration required',
      'Product/service quality standards',
      'Bank account and PAN card',
    ],
    applicationUrl: 'https://gem.gov.in/',
    benefits: [
      'Direct access to government procurement',
      'Transparent and efficient bidding process',
      'Timely payment (10-15 days)',
      'No intermediaries or commissions',
      'Preference to MSMEs and startups',
      'Training and onboarding support',
      'Analytics and market insights',
      'Nationwide market access',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 20,
      'cooperative-cluster': 70,
      'sme-scale': 100,
      'export-oriented': 60,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Not applicable - procurement platform',
    },
    targetAudience: {
      incomeLevel: ['medium', 'medium-high', 'high'],
      businessScale: ['Registered MSME', 'Product/service provider'],
      digitalRequirement: 'Fully digital - online bidding and documentation',
    },
  },
  
  {
    id: 'digital-india-msme',
    title: 'Digital India Programme for MSMEs',
    description: 'Comprehensive digital transformation support for MSMEs including website development, digital marketing, and technology adoption. Provides subsidized digital infrastructure and training.',
    categories: ['sme-scale', 'family-based'],
    loanAmount: {
      min: 100000,
      max: 2000000,
      currency: 'INR',
    },
    interestRate: {
      original: 6,
      subsidized: 4,
      subventionPercentage: 2,
    },
    subsidyPercentage: 50,
    collateralFree: true,
    eligibility: [
      'Registered MSMEs',
      'Artisan enterprises seeking digital transformation',
      'Willingness to adopt digital technologies',
      'Basic digital literacy',
    ],
    applicationUrl: 'https://digitalindia.gov.in/',
    benefits: [
      '50% subsidy on website development',
      '50% subsidy on digital marketing tools',
      'Free digital literacy training',
      'Cloud computing credits',
      'Cybersecurity support',
      'E-commerce platform integration',
      'Digital payment infrastructure',
      'Social media marketing training',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 60,
      'cooperative-cluster': 70,
      'sme-scale': 100,
      'export-oriented': 90,
    },
    financialDetails: {
      loanAmount: {
        min: 100000,
        max: 2000000,
        currency: 'INR',
      },
      interestRate: {
        original: 6,
        subsidized: 4,
        subventionPercentage: 2,
      },
      subsidies: [
        {
          type: 'equipment',
          percentage: 50,
          maxAmount: 1000000,
          eligibility: ['MSMEs for digital infrastructure'],
        },
      ],
      collateralFree: true,
      repaymentTerms: '3-5 years with flexible repayment',
    },
    targetAudience: {
      incomeLevel: ['low-medium', 'medium', 'medium-high'],
      businessScale: ['MSME seeking digital transformation', '5-50 employees'],
      digitalRequirement: 'Basic to moderate - training provided',
    },
  },
];


// ============================================================================
// Export-Oriented Artisan Enterprise Schemes
// ============================================================================

/**
 * Schemes for Export-Oriented Artisan Enterprises (High Income, Fully Digital)
 * Income: ₹5-30 crore per year
 * Digital Literacy: Fully Digital
 */
const EXPORT_ORIENTED_SCHEMES: SchemeWithCategory[] = [
  {
    id: 'mai',
    title: 'Market Access Initiative (MAI)',
    description: 'Scheme for promoting exports by providing financial assistance for market development activities. Supports participation in international trade fairs, buyer-seller meets, and export promotion activities.',
    categories: ['export-oriented', 'sme-scale'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 75,
    collateralFree: true,
    eligibility: [
      'Export-oriented enterprises',
      'Export turnover up to ₹30 crore',
      'Registered with Export Promotion Council',
      'IEC (Import Export Code) holder',
    ],
    applicationUrl: 'https://commerce.gov.in/mai/',
    benefits: [
      '75% financial assistance for international trade fairs',
      '75% assistance for buyer-seller meets abroad',
      '75% assistance for market studies and surveys',
      'Support for brand promotion in foreign markets',
      'Assistance for product launches abroad',
      'Support for e-commerce export initiatives',
      'Reimbursement of air travel and accommodation',
      'Maximum assistance: ₹15 lakh per event',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 0,
      'cooperative-cluster': 30,
      'sme-scale': 70,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 75,
          maxAmount: 1500000,
          eligibility: ['Export enterprises with turnover up to ₹30 crore'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Grant-based - no repayment required',
    },
    targetAudience: {
      incomeLevel: ['high'],
      businessScale: ['Export enterprise', 'Turnover up to ₹30 crore'],
      digitalRequirement: 'Fully digital - international business operations',
    },
  },
  
  {
    id: 'mda',
    title: 'Marketing Development Assistance (MDA)',
    description: 'Scheme providing financial assistance for export promotion activities including participation in international exhibitions, trade fairs, and buyer-seller meets. Covers travel, freight, and marketing expenses.',
    categories: ['export-oriented', 'sme-scale'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 100,
    collateralFree: true,
    eligibility: [
      'Export-oriented MSMEs',
      'Handicraft and handloom exporters',
      'Registered with relevant Export Promotion Council',
      'Minimum 2 years export track record',
    ],
    applicationUrl: 'https://commerce.gov.in/mda/',
    benefits: [
      '100% reimbursement of space rental at international fairs',
      '100% freight subsidy for sample shipments',
      'Air travel reimbursement for international events',
      'Hotel accommodation support',
      'Catalog and brochure development assistance',
      'Website development for export promotion',
      'Participation in virtual trade fairs',
      'Market research and intelligence support',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 0,
      'cooperative-cluster': 40,
      'sme-scale': 80,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 100,
          eligibility: ['Export-oriented MSMEs for marketing activities'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Grant-based - no repayment required',
    },
    targetAudience: {
      incomeLevel: ['medium-high', 'high'],
      businessScale: ['Export MSME', 'Established export track record'],
      digitalRequirement: 'Fully digital - international marketing',
    },
  },
  
  {
    id: 'bharat-tulip',
    title: 'Bharat Trade and Upliftment of Livelihoods through International Partnerships (Bharat TULIP)',
    description: 'Programme facilitating B2B meetings between Indian exporters and international buyers. Provides platform for artisan enterprises to connect with global buyers and explore export opportunities.',
    categories: ['export-oriented', 'sme-scale'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 0,
    collateralFree: true,
    eligibility: [
      'Export-ready artisan enterprises',
      'Product quality meeting international standards',
      'Capacity to fulfill export orders',
      'IEC holder',
    ],
    applicationUrl: 'https://commerce.gov.in/bharat-tulip/',
    benefits: [
      'Free B2B meeting arrangements with international buyers',
      'Market intelligence and buyer information',
      'Export documentation support',
      'Quality certification guidance',
      'Logistics and shipping assistance',
      'Payment terms negotiation support',
      'Follow-up support for order fulfillment',
      'Networking with export promotion councils',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 0,
      'cooperative-cluster': 50,
      'sme-scale': 80,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [],
      collateralFree: true,
      repaymentTerms: 'Not applicable - facilitation programme',
    },
    targetAudience: {
      incomeLevel: ['medium-high', 'high'],
      businessScale: ['Export-ready enterprise', 'International quality standards'],
      digitalRequirement: 'Fully digital - international communication',
    },
  },
  
  {
    id: 'gi-support',
    title: 'Geographical Indication (GI) Support Scheme',
    description: 'Scheme for registration and protection of Geographical Indications for traditional crafts and products. Provides financial assistance for GI registration, legal support, and brand promotion.',
    categories: ['export-oriented', 'cooperative-cluster'],
    loanAmount: {
      min: 0,
      max: 0,
      currency: 'INR',
    },
    interestRate: {
      original: 0,
      subsidized: 0,
      subventionPercentage: 0,
    },
    subsidyPercentage: 100,
    collateralFree: true,
    eligibility: [
      'Traditional craft clusters',
      'Artisan associations and cooperatives',
      'Products with unique geographical origin',
      'Established traditional production methods',
    ],
    applicationUrl: 'https://ipindia.gov.in/gi-registration.htm',
    benefits: [
      '100% financial assistance for GI registration',
      'Legal support for IPR protection',
      'Brand promotion and marketing support',
      'Quality certification assistance',
      'Protection against counterfeiting',
      'Premium pricing opportunities',
      'Export market access',
      'Collective brand building support',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 30,
      'cooperative-cluster': 80,
      'sme-scale': 70,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 0,
        max: 0,
        currency: 'INR',
      },
      interestRate: {
        original: 0,
        subsidized: 0,
        subventionPercentage: 0,
      },
      subsidies: [
        {
          type: 'infrastructure',
          percentage: 100,
          eligibility: ['Traditional craft clusters for GI registration'],
        },
      ],
      collateralFree: true,
      repaymentTerms: 'Grant-based - no repayment required',
    },
    targetAudience: {
      incomeLevel: ['medium', 'medium-high', 'high'],
      businessScale: ['Craft cluster', 'Artisan association', 'Export enterprise'],
      digitalRequirement: 'Moderate to fully digital',
    },
  },
  
  {
    id: 'ecgc-exim',
    title: 'Export Credit Guarantee Corporation (ECGC) and EXIM Bank Programmes',
    description: 'Comprehensive export credit insurance and financing solutions. Provides pre-shipment and post-shipment credit, export insurance, and risk coverage for international trade.',
    categories: ['export-oriented'],
    loanAmount: {
      min: 5000000,
      max: 500000000,
      currency: 'INR',
    },
    interestRate: {
      original: 7,
      subsidized: 5,
      subventionPercentage: 2,
    },
    subsidyPercentage: 0,
    collateralFree: false,
    eligibility: [
      'Export-oriented enterprises',
      'Minimum export turnover ₹5 crore',
      'Good credit history',
      'Export orders or contracts',
    ],
    applicationUrl: 'https://www.ecgc.in/ and https://www.eximbankindia.in/',
    benefits: [
      'Pre-shipment credit for production',
      'Post-shipment credit for working capital',
      'Export credit insurance (up to 90% coverage)',
      'Political and commercial risk coverage',
      'Buyer credit for international customers',
      'Interest rate subsidy of 2%',
      'Foreign currency loans',
      'Export factoring services',
    ],
    categoryRelevance: {
      'low-income-individual': 0,
      'family-based': 0,
      'cooperative-cluster': 20,
      'sme-scale': 60,
      'export-oriented': 100,
    },
    financialDetails: {
      loanAmount: {
        min: 5000000,
        max: 500000000,
        currency: 'INR',
      },
      interestRate: {
        original: 7,
        subsidized: 5,
        subventionPercentage: 2,
      },
      subsidies: [],
      collateralFree: false,
      repaymentTerms: '6 months to 5 years depending on credit type',
    },
    targetAudience: {
      incomeLevel: ['high'],
      businessScale: ['Large export enterprise', 'Turnover ₹5+ crore'],
      digitalRequirement: 'Fully digital - international banking and documentation',
    },
  },
];


// ============================================================================
// Combined Scheme Data
// ============================================================================

/**
 * All schemes combined across all categories
 */
export const ALL_SCHEMES: SchemeWithCategory[] = [
  ...LOW_INCOME_INDIVIDUAL_SCHEMES,
  ...FAMILY_BASED_SCHEMES,
  ...COOPERATIVE_CLUSTER_SCHEMES,
  ...SME_SCALE_SCHEMES,
  ...EXPORT_ORIENTED_SCHEMES,
];

/**
 * Schemes organized by category
 */
export const SCHEMES_BY_CATEGORY: Record<CategoryType, SchemeWithCategory[]> = {
  'low-income-individual': LOW_INCOME_INDIVIDUAL_SCHEMES,
  'family-based': FAMILY_BASED_SCHEMES,
  'cooperative-cluster': COOPERATIVE_CLUSTER_SCHEMES,
  'sme-scale': SME_SCALE_SCHEMES,
  'export-oriented': EXPORT_ORIENTED_SCHEMES,
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get all schemes
 */
export function getAllSchemes(): SchemeWithCategory[] {
  return ALL_SCHEMES;
}

/**
 * Get schemes by category
 */
export function getSchemesByCategory(category: CategoryType): SchemeWithCategory[] {
  return SCHEMES_BY_CATEGORY[category] || [];
}

/**
 * Get schemes by multiple categories (with deduplication)
 */
export function getSchemesByCategories(categories: CategoryType[]): SchemeWithCategory[] {
  if (categories.length === 0) {
    return ALL_SCHEMES;
  }
  
  const schemeMap = new Map<string, SchemeWithCategory>();
  
  categories.forEach(category => {
    const schemes = SCHEMES_BY_CATEGORY[category] || [];
    schemes.forEach(scheme => {
      if (!schemeMap.has(scheme.id)) {
        schemeMap.set(scheme.id, scheme);
      }
    });
  });
  
  return Array.from(schemeMap.values());
}

/**
 * Get scheme by ID
 */
export function getSchemeById(id: string): SchemeWithCategory | undefined {
  return ALL_SCHEMES.find(scheme => scheme.id === id);
}

/**
 * Search schemes by keyword
 */
export function searchSchemes(keyword: string): SchemeWithCategory[] {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_SCHEMES.filter(scheme =>
    scheme.title.toLowerCase().includes(lowerKeyword) ||
    scheme.description.toLowerCase().includes(lowerKeyword) ||
    scheme.benefits.some(benefit => benefit.toLowerCase().includes(lowerKeyword))
  );
}

/**
 * Filter schemes by loan amount range
 */
export function filterSchemesByLoanAmount(
  minAmount: number,
  maxAmount: number
): SchemeWithCategory[] {
  return ALL_SCHEMES.filter(scheme =>
    scheme.loanAmount.max >= minAmount &&
    scheme.loanAmount.min <= maxAmount
  );
}

/**
 * Filter schemes by collateral requirement
 */
export function filterSchemesByCollateral(collateralFree: boolean): SchemeWithCategory[] {
  return ALL_SCHEMES.filter(scheme => scheme.collateralFree === collateralFree);
}

/**
 * Get schemes with subsidies
 */
export function getSchemesWithSubsidies(): SchemeWithCategory[] {
  return ALL_SCHEMES.filter(scheme =>
    scheme.subsidyPercentage && scheme.subsidyPercentage > 0
  );
}

/**
 * Get schemes with interest subvention
 */
export function getSchemesWithInterestSubvention(): SchemeWithCategory[] {
  return ALL_SCHEMES.filter(scheme =>
    scheme.interestRate.subventionPercentage &&
    scheme.interestRate.subventionPercentage > 0
  );
}

/**
 * Calculate total scheme count
 */
export function getTotalSchemeCount(): number {
  return ALL_SCHEMES.length;
}

/**
 * Get scheme count by category
 */
export function getSchemeCountByCategory(category: CategoryType): number {
  return SCHEMES_BY_CATEGORY[category]?.length || 0;
}

/**
 * Get all scheme counts by category
 */
export function getAllSchemeCounts(): Record<CategoryType, number> {
  return {
    'low-income-individual': LOW_INCOME_INDIVIDUAL_SCHEMES.length,
    'family-based': FAMILY_BASED_SCHEMES.length,
    'cooperative-cluster': COOPERATIVE_CLUSTER_SCHEMES.length,
    'sme-scale': SME_SCALE_SCHEMES.length,
    'export-oriented': EXPORT_ORIENTED_SCHEMES.length,
  };
}
