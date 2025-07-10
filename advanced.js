// Advanced mental math word problem templates for QuantCrush

const advancedTemplates = [
  // 1. Percent Change
  {
    generate: () => {
      const oldPrice = Math.floor(Math.random() * 40 + 10) * 10; // $100-$500 in multiples of 10
      const percent = Math.floor(Math.random() * 9 + 2) * 5; // 10%-50% in multiples of 5
      const up = Math.random() < 0.5;
      const newPrice = up
        ? oldPrice * (1 + percent / 100)
        : oldPrice * (1 - percent / 100);
      return {
        question: `A stock is $${oldPrice}. It ${up ? 'increases' : 'decreases'} by ${percent}%. What is the new price?`,
        answer: Math.round(newPrice * 100) / 100
      };
    }
  },
  // 2. Markup
  {
    generate: () => {
      const cost = Math.floor(Math.random() * 40 + 10) * 10; // $100-$500 in multiples of 10
      const markup = Math.floor(Math.random() * 9 + 2) * 5; // 10%-50% in multiples of 5
      const price = cost * (1 + markup / 100);
      return {
        question: `A product costs $${cost}. If the store marks it up by ${markup}%, what is the selling price?`,
        answer: Math.round(price * 100) / 100
      };
    }
  },
  // 3. Discount
  {
    generate: () => {
      const price = Math.floor(Math.random() * 40 + 10) * 10; // $100-$500 in multiples of 10
      const discount = Math.floor(Math.random() * 9 + 2) * 5; // 10%-50% in multiples of 5
      const sale = price * (1 - discount / 100);
      return {
        question: `A product is $${price}. It is on sale for ${discount}% off. What is the sale price?`,
        answer: Math.round(sale * 100) / 100
      };
    }
  },
  // 4. Reverse Percentage
  {
    generate: () => {
      const after = Math.floor(Math.random() * 40 + 10) * 10; // $100-$500 in multiples of 10
      const percent = Math.floor(Math.random() * 9 + 2) * 5; // 10%-50% in multiples of 5
      const before = after / (1 - percent / 100);
      return {
        question: `After a ${percent}% discount, a product costs $${after}. What was the original price?`,
        answer: Math.round(before * 100) / 100
      };
    }
  },
  // 5. Ratio
  {
    generate: () => {
      const a = Math.floor(Math.random() * 9 + 2); // 2-10
      const b = Math.floor(Math.random() * 9 + 2); // 2-10
      const total = Math.floor(Math.random() * 20 + 5) * 10; // $50-$250 in multiples of 10
      const partA = (a / (a + b)) * total;
      return {
        question: `A bonus is split in the ratio ${a}:${b}. If the total is $${total}, how much does the first person get?`,
        answer: Math.round(partA * 100) / 100
      };
    }
  },
  // 6. Multi-step: Salary Raise then Tax
  {
    generate: () => {
      const salary = Math.floor(Math.random() * 4 + 4) * 10000; // $40k-$80k in multiples of 10k
      const raise = Math.floor(Math.random() * 3 + 1) * 5; // 5%-15% in multiples of 5
      const tax = Math.floor(Math.random() * 3 + 4) * 5; // 20%-30% in multiples of 5
      const newSalary = salary * (1 + raise / 100);
      const afterTax = newSalary * (1 - tax / 100);
      return {
        question: `A salary is $${salary}. It increases by ${raise}%, then ${tax}% tax is applied. What is the final amount?`,
        answer: Math.round(afterTax * 100) / 100
      };
    }
  },
  // 7. Investment Loss then Gain
  {
    generate: () => {
      const start = Math.floor(Math.random() * 90 + 10) * 100; // $1,000-$10,000 in multiples of 100
      const loss = Math.floor(Math.random() * 5 + 2) * 5; // 10%-30% in multiples of 5
      const gain = Math.floor(Math.random() * 5 + 2) * 5; // 10%-30% in multiples of 5
      const afterLoss = start * (1 - loss / 100);
      const afterGain = afterLoss * (1 + gain / 100);
      return {
        question: `An investment of $${start} loses ${loss}%, then gains ${gain}%. What is its value now?`,
        answer: Math.round(afterGain * 100) / 100
      };
    }
  },
  // 8. Price Increase then Decrease
  {
    generate: () => {
      const price = Math.floor(Math.random() * 40 + 10) * 10; // $100-$500 in multiples of 10
      const up = Math.floor(Math.random() * 5 + 2) * 5; // 10%-30% in multiples of 5
      const down = Math.floor(Math.random() * 5 + 2) * 5; // 10%-30% in multiples of 5
      const afterUp = price * (1 + up / 100);
      const afterDown = afterUp * (1 - down / 100);
      return {
        question: `A product is $${price}. Its price increases by ${up}%, then decreases by ${down}%. What is the final price?`,
        answer: Math.round(afterDown * 100) / 100
      };
    }
  }
];

function generateWordProblem() {
  const idx = Math.floor(Math.random() * advancedTemplates.length);
  return advancedTemplates[idx].generate();
}

// Export for use in QuantCrush
if (typeof module !== 'undefined') {
  module.exports = { advancedTemplates, generateWordProblem };
}