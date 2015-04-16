namespace RecloBM
{
    partial class Form2
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Form2));
            this.nameTB = new System.Windows.Forms.TextBox();
            this.passTB = new System.Windows.Forms.TextBox();
            this.emailTB = new System.Windows.Forms.TextBox();
            this.label1 = new System.Windows.Forms.Label();
            this.label2 = new System.Windows.Forms.Label();
            this.label3 = new System.Windows.Forms.Label();
            this.regBTN = new System.Windows.Forms.Button();
            this.linkLabel1 = new System.Windows.Forms.LinkLabel();
            this.backBTN = new System.Windows.Forms.Button();
            this.RegErrorLB = new System.Windows.Forms.Label();
            this.pictureBox2 = new System.Windows.Forms.PictureBox();
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).BeginInit();
            this.SuspendLayout();
            // 
            // nameTB
            // 
            this.nameTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.nameTB.Location = new System.Drawing.Point(12, 195);
            this.nameTB.Name = "nameTB";
            this.nameTB.Size = new System.Drawing.Size(315, 22);
            this.nameTB.TabIndex = 0;
            // 
            // passTB
            // 
            this.passTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.passTB.Location = new System.Drawing.Point(12, 292);
            this.passTB.Name = "passTB";
            this.passTB.PasswordChar = '*';
            this.passTB.Size = new System.Drawing.Size(315, 22);
            this.passTB.TabIndex = 2;
            this.passTB.UseSystemPasswordChar = true;
            // 
            // emailTB
            // 
            this.emailTB.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.emailTB.Location = new System.Drawing.Point(12, 247);
            this.emailTB.Name = "emailTB";
            this.emailTB.Size = new System.Drawing.Size(315, 22);
            this.emailTB.TabIndex = 3;
            // 
            // label1
            // 
            this.label1.AutoSize = true;
            this.label1.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label1.Location = new System.Drawing.Point(12, 175);
            this.label1.Name = "label1";
            this.label1.Size = new System.Drawing.Size(107, 17);
            this.label1.TabIndex = 4;
            this.label1.Text = "Display Name";
            // 
            // label2
            // 
            this.label2.AutoSize = true;
            this.label2.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label2.Location = new System.Drawing.Point(9, 227);
            this.label2.Name = "label2";
            this.label2.Size = new System.Drawing.Size(47, 17);
            this.label2.TabIndex = 5;
            this.label2.Text = "Email";
            // 
            // label3
            // 
            this.label3.AutoSize = true;
            this.label3.Cursor = System.Windows.Forms.Cursors.Default;
            this.label3.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.label3.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.label3.Location = new System.Drawing.Point(9, 272);
            this.label3.Name = "label3";
            this.label3.Size = new System.Drawing.Size(77, 17);
            this.label3.TabIndex = 6;
            this.label3.Text = "Password";

            // 
            // regBTN
            // 
            this.regBTN.BackColor = System.Drawing.Color.DimGray;
            this.regBTN.FlatAppearance.BorderSize = 0;
            this.regBTN.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.regBTN.Font = new System.Drawing.Font("Microsoft Sans Serif", 13.8F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.regBTN.ForeColor = System.Drawing.Color.White;
            this.regBTN.Location = new System.Drawing.Point(12, 404);
            this.regBTN.Name = "regBTN";
            this.regBTN.Size = new System.Drawing.Size(315, 68);
            this.regBTN.TabIndex = 7;
            this.regBTN.Text = "Register";
            this.regBTN.UseVisualStyleBackColor = false;
            this.regBTN.Click += new System.EventHandler(this.regBTN_Click);
            // 
            // linkLabel1
            // 
            this.linkLabel1.AutoSize = true;
            this.linkLabel1.Location = new System.Drawing.Point(216, 9);
            this.linkLabel1.Name = "linkLabel1";
            this.linkLabel1.Size = new System.Drawing.Size(123, 17);
            this.linkLabel1.TabIndex = 10;
            this.linkLabel1.TabStop = true;
            this.linkLabel1.Text = "More About ReClo";
            this.linkLabel1.LinkClicked += new System.Windows.Forms.LinkLabelLinkClickedEventHandler(this.linkLabel1_LinkClicked);
            // 
            // backBTN
            // 
            this.backBTN.BackColor = System.Drawing.Color.Silver;
            this.backBTN.FlatAppearance.BorderColor = System.Drawing.Color.Black;
            this.backBTN.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.backBTN.Font = new System.Drawing.Font("Microsoft Sans Serif", 7.8F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.backBTN.ForeColor = System.Drawing.Color.Black;
            this.backBTN.Location = new System.Drawing.Point(-7, -4);
            this.backBTN.Name = "backBTN";
            this.backBTN.Size = new System.Drawing.Size(85, 37);
            this.backBTN.TabIndex = 12;
            this.backBTN.Text = "Back ";
            this.backBTN.UseVisualStyleBackColor = false;
            this.backBTN.Click += new System.EventHandler(this.button3_Click);
            // 
            // RegErrorLB
            // 
            this.RegErrorLB.AutoSize = true;
            this.RegErrorLB.Font = new System.Drawing.Font("Microsoft Sans Serif", 9F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.RegErrorLB.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(192)))), ((int)(((byte)(0)))), ((int)(((byte)(0)))));
            this.RegErrorLB.Location = new System.Drawing.Point(12, 317);
            this.RegErrorLB.Name = "RegErrorLB";
            this.RegErrorLB.Size = new System.Drawing.Size(42, 18);
            this.RegErrorLB.TabIndex = 13;
            this.RegErrorLB.Text = "Error";
            // 
            // pictureBox2
            // 
            this.pictureBox2.BorderStyle = System.Windows.Forms.BorderStyle.FixedSingle;
            this.pictureBox2.Image = ((System.Drawing.Image)(resources.GetObject("pictureBox2.Image")));
            this.pictureBox2.Location = new System.Drawing.Point(0, 29);
            this.pictureBox2.Name = "pictureBox2";
            this.pictureBox2.Size = new System.Drawing.Size(355, 124);
            this.pictureBox2.TabIndex = 9;
            this.pictureBox2.TabStop = false;
            // 
            // Form2
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(8F, 16F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(339, 484);
            this.Controls.Add(this.RegErrorLB);
            this.Controls.Add(this.pictureBox2);
            this.Controls.Add(this.backBTN);
            this.Controls.Add(this.linkLabel1);
            this.Controls.Add(this.regBTN);
            this.Controls.Add(this.label3);
            this.Controls.Add(this.label2);
            this.Controls.Add(this.label1);
            this.Controls.Add(this.emailTB);
            this.Controls.Add(this.passTB);
            this.Controls.Add(this.nameTB);
            this.MaximumSize = new System.Drawing.Size(357, 531);
            this.MinimumSize = new System.Drawing.Size(357, 531);
            this.Name = "Form2";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "Register";
            ((System.ComponentModel.ISupportInitialize)(this.pictureBox2)).EndInit();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TextBox nameTB;
        private System.Windows.Forms.TextBox passTB;
        private System.Windows.Forms.TextBox emailTB;
        private System.Windows.Forms.Label label1;
        private System.Windows.Forms.Label label2;
        private System.Windows.Forms.Label label3;
        private System.Windows.Forms.Button regBTN;
        private System.Windows.Forms.PictureBox pictureBox2;
        private System.Windows.Forms.LinkLabel linkLabel1;
        private System.Windows.Forms.Button backBTN;
        private System.Windows.Forms.Label RegErrorLB;
    }
}