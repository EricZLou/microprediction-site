function LoadFAQ(categories) {

  let faq_container = document.getElementById("faq-container");
  // For each FAQ subsection
  for (let category in categories) {

    // Create the subsection title
    let category_div = document.createElement("h2");
    category_div.innerText = category;
    faq_container.appendChild(category_div);

    // For each question and answer in the subsection
    for (qa of categories[category]) {
      let question = qa[0];
      let answer = qa[1];

      // Create the question
      let q_container = document.createElement("div");
      q_container.id = "faq-q-container";
      let q_Q = document.createElement("div");
      q_Q.id = "faq-q";
      q_Q.innerText = "Q: ";
      let q_text = document.createElement("div");
      q_text.id = "faq-text";
      q_text.innerHTML = question;

      q_container.appendChild(q_Q);
      q_container.appendChild(q_text);

      // Create the answer
      let a_container = document.createElement("div");
      a_container.id = "faq-a-container";
      let a_A = document.createElement("div");
      a_A.id = "faq-a";
      a_A.innerText = "A: ";
      let a_text = document.createElement("div");
      a_text.id = "faq-text";
      a_text.innerHTML = answer;

      a_container.appendChild(a_A);
      a_container.appendChild(a_text);

      // Add them to the subsection
      faq_container.appendChild(q_container);
      faq_container.appendChild(a_container);
    }
  }
}