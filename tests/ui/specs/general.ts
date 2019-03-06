describe("General", () => {

    it("loads", () => {
        cy.visit("/");
    });

    it("shows the editor UI", () => {
        cy.get(".node-editor");
    });

});
